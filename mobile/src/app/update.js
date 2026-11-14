import { Linking } from 'react-native';
import { Body, Button, Overline, Screen, Title } from '../components/ui';

// Set EXPO_PUBLIC_APP_STORE_URL once the App Store listing exists.
const STORE_URL = process.env.EXPO_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/search?term=the%20mahjong%20tarot';

// Shown when the website's MOBILE_MIN_BUILD is above this app's build.
export default function UpdateRequired() {
  return (
    <Screen contentStyle={{ paddingTop: 80 }}>
      <Overline>Update needed</Overline>
      <Title size={30} em="App Store">Please update from the </Title>
      <Body>This version of The Mahjong Tarot is too old to keep working. The update is free and takes a moment.</Body>
      <Button title="Open the App Store" onPress={() => Linking.openURL(STORE_URL)} />
    </Screen>
  );
}
