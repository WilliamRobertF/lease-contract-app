import { registerRootComponent } from 'expo';

// Initialize i18n FIRST before App renders
import './src/i18n/i18n';

import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
