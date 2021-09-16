<script lang="tsx">
import { defineComponent, computed } from "vue";
import { Dropdown, Menu } from "ant-design-vue";
import {
  langSpec,
  supportLangs,
} from "@/components/BibEditor/node-views/code-block-view";

export default defineComponent({
  setup() {
    const capitalizeLangSpec = (str: string) =>
      str[0].toUpperCase() + str.slice(1);
    const slots = {
      overlay: () => (
        <Menu>
          {supportLangs.map((lang) => (
            <Menu.Item
              key={lang as string}
              onClick={() => {
                langSpec.value = lang as any;
              }}
            >
              {lang}
            </Menu.Item>
          ))}
        </Menu>
      ),
    };
    const displayLangSpec = computed(() =>
      langSpec.value ? capitalizeLangSpec(langSpec.value) : "Plain Text"
    );

    return () => (
      <Dropdown
        v-slots={slots}
        overlayClassName="bib-editor__code-block-lang-switcher-overlay"
      >
        <div class="bib-editor__code-block-lang-switcher code-style-text">
          {"language: "}
          {displayLangSpec.value}
        </div>
      </Dropdown>
    );
  },
});
</script>

<style lang="less">
.bib-editor__code-block-lang-switcher {
  position: absolute;
  left: 0;
  top: -27px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  width: fit-content;
  background-color: rgb(222 239 253);
  color: #4e4f4f;
  padding: 2px 6px;
  font-size: 14px;
  z-index: 3;
  user-select: none;
}
.bib-editor__code-block-lang-switcher-overlay {
  border: 0.5px #eeeeee solid;
  max-height: 300px;
  overflow: auto;
  z-index: 19;
}
</style>
