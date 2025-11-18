# Guia de Atualizações OTA (Over-The-Air)

## 🚀 Como enviar atualizações sem gerar novo APK

### 1. Fazer suas alterações no código
```bash
# Faça as alterações necessárias no código
# Teste localmente com: npx expo start
```

### 2. Enviar atualização para o canal preview (teste)
```bash
npx eas update --branch preview --message "Descrição da atualização"
```

### 3. Enviar atualização para produção
```bash
npx eas update --branch production --message "Descrição da atualização"
```

## 📱 Como funciona

- **Para APK de teste (preview)**: Use `--branch preview`
- **Para APK de produção**: Use `--branch production`
- O app verifica atualizações automaticamente quando:
  - Abre o app
  - Volta do background após 30 minutos

## ⚠️ Limitações

**Atualizações OTA funcionam apenas para:**
- ✅ Mudanças em JavaScript/TypeScript
- ✅ Mudanças em assets (imagens, etc)
- ✅ Mudanças em configurações do app.json

**NÃO funcionam para:**
- ❌ Mudanças em código nativo (Java/Kotlin)
- ❌ Mudanças em dependências nativas
- ❌ Mudanças em permissões do AndroidManifest
- ❌ Mudanças na versão do SDK do Expo

Para essas mudanças, você precisa gerar um novo APK com:
```bash
eas build --platform android --profile preview
```

## 🔄 Forçar verificação de atualização

Se quiser que o usuário veja atualizações imediatamente, adicione este código ao App.tsx:

```typescript
import * as Updates from 'expo-updates';

useEffect(() => {
  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (e) {
      console.log('Error checking for updates:', e);
    }
  }
  checkForUpdates();
}, []);
```

## 📊 Ver histórico de atualizações

```bash
npx eas update:list --branch preview
npx eas update:list --branch production
```

## 🎯 Exemplo de fluxo de trabalho

1. Faz alteração no código
2. Testa localmente: `npx expo start`
3. Envia para teste: `npx eas update --branch preview --message "Fix: corrigido bug XYZ"`
4. Testador abre o app e recebe a atualização automaticamente
5. Se tudo OK, envia para produção: `npx eas update --branch production --message "Fix: corrigido bug XYZ"`

## 💡 Dicas

- Use mensagens descritivas nas atualizações
- Teste sempre no canal preview antes de enviar para production
- Atualizações são instantâneas (não precisa esperar aprovação)
- Não há custo adicional para atualizações OTA no plano gratuito do EAS
