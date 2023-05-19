import { For } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { platformSettingsUIList } from '@/stores/provider'
import { providerSettingsMap, setSettingsByProviderId, updateGeneralSettings } from '@/stores/settings'
import ThemeToggle from '../ui/ThemeToggle'
import ProviderGlobalSettings from './ProviderGlobalSettings'
import AppGeneralSettings from './AppGeneralSettings'
import type { GeneralSettings } from '@/types/app'

export default () => {
  const $providerSettingsMap = useStore(providerSettingsMap)
  const generalSettings = () => {
    return ($providerSettingsMap().general || {}) as unknown as GeneralSettings
  }

  return (
    <div class="h-full flex flex-col bg-sidebar">
      <header class="h-14 fi border-b border-base px-4 text-xs uppercase">
        设置
      </header>
      <main class="flex-1 overflow-auto">
        <AppGeneralSettings
          settingsValue={() => generalSettings()}
          updateSettings={updateGeneralSettings}
        />

        <For each={platformSettingsUIList}>
          {item => (
            <ProviderGlobalSettings
              config={item}
              settingsValue={() => $providerSettingsMap()[item.id]}
              setSettings={v => setSettingsByProviderId(item.id, v)}
            />
          )}
        </For>
      </main>
      <footer class="h-14 fi justify-between px-3">
        <ThemeToggle />
        <div text-xs op-40 px-2>
          <a href="https://img.wzjo2o.com/1684026296469.jpg" target="_blank" rel="noreferrer" class="hv-foreground">
            加群防失联
          </a>
          <span class="px-1"> · </span>
          <a href="https://lg8h2izm09.feishu.cn/docx/YU7UduJFNoMKSPxa94JcWkd0nJg" target="_blank" rel="noreferrer" class="hv-foreground">
            使用说明
          </a>
          <span class="px-1"> · </span>
          <a href="https://gpt100.chatxyz.online" target="_blank" rel="noreferrer" class="hv-foreground">
            GPT3.5站点
          </a>
        </div>
      </footer>
    </div>
  )
}
