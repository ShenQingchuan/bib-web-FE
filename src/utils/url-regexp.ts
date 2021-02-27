/**
 * A regex that can match URLs in strings.
 * Modified so they can match most of the formats people use for URLs
 * and not leave out parts of URLs when not anchored.
 *
 * Sources:
 * https://gist.github.com/dperini/729294 for the url-matching part
 * https://gist.github.com/syzdek/6086792 for the IPv6 regex
 */

const r = String.raw;

// protocol identifier (optional)
const PROTOCOL = r`(?:(?:https?|ftps?|file)?:?\/\/)?`;

// user:pass BasicAuth (optional)
const AUTH = r`(?:\S+(?::\S*)?@)?`;

const HOST = [
  // host & domain names, may end with dot
  // can be replaced by a shortest alternative
  // (?![-_])(?:[-\w\u00a1-\uffff]{0,63}[^-_]\.)+
  r`(?:`,
  r`(?:`,
  r`[a-z0-9\u00a1-\uffff]`,
  r`[a-z0-9\u00a1-\uffff_-]{0,62}`,
  r`)?`,
  r`[a-z0-9\u00a1-\uffff](\.)?`,
  r`)+`,

  // TLD identifier name, may end with dot
  r`(?:[a-z\u00a1-\uffff]{2,}\.?)`
].join('');

// IP address dotted notation octets
// excludes loopback network 0.0.0.0
// excludes reserved space >= 224.0.0.0
// excludes network & broacast addresses
// (first & last IP address of each class)
const IPV4 =
  '(?:' +
  [
    // first octet
    r`(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])`,

    // second and third octets
    r`(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}`,

    // fourth octet
    r`(?:\.(?:1\d\d|2[0-4]\d|25[0-4]|[1-9]\d?))`
  ].join('') +
  ')';

// the IPv6 matching part is from here: https://gist.github.com/syzdek/6086792
// IPv6 address in URLs are wrapped with []s
const IPV6 =
  r`\[(?:` +
  [
    // 1:2:3:4:5:6:7:8
    r`(?:[\da-f]{1,4}:){7,7}[\da-f]{1,4}`,

    // 2001:db8:3:4::192.0.2.33  64:ff9b::192.0.2.33  (IPv4-Embedded IPv6 Address)
    r`(?:[\da-f]{1,4}:){1,4}:${IPV4}`,

    // ::255.255.255.255  ::ffff:255.255.255.255  ::ffff:0:255.255.255.255  (IPv4-mapped IPv6 addresses)
    r`::(?:ffff(?::0{1,4}){0,1}:){0,1}${IPV4}`,

    // 1::3:4:5:6:7:8  1::3:4:5:6:7:8 1::8
    r`[\da-f]{1,4}:(?:(?::[\da-f]{1,4}){1,6})`,

    // 1::4:5:6:7:8  1:2::4:5:6:7:8  1:2::8
    r`(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}`,

    // 1::5:6:7:8  1:2:3::5:6:7:8  1:2:3::8
    r`(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}`,

    // 1::6:7:8  1:2:3:4::6:7:8  1:2:3:4::8
    r`(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}`,

    // 1::7:8  1:2:3:4:5::7:8  1:2:3:4:5::8
    r`(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}`,

    // 1::8  1:2:3:4:5:6::8  1:2:3:4:5:6::8
    r`(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}`,

    // 1::
    r`(?:[\da-f]{1,4}:){1,7}:`,

    // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8  ::
    r`:(?:(?::[\da-f]{1,4}){1,7}|:)`
  ].join('|') +
  r`)\]`;

// port number (optional)
const PORT = r`(?::\d{2,5})?`;

// resource path (optional)
const PATH = r`(?:[/?#]\S*)?`;

const URL_REGEX = new RegExp(
  r`^${PROTOCOL}${AUTH}(?:${IPV4}|${IPV6}|${HOST})${PORT}${PATH}$`,
  'gi'
);

export default URL_REGEX;
