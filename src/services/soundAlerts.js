import { Audio } from 'expo-av'

export async function playRoleAlertSound() {
  try {
    const sound = new Audio.Sound()
    await sound.loadAsync({
      uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
    })
    await sound.playAsync()
    setTimeout(() => {
      sound.unloadAsync().catch(() => {})
    }, 2500)
  } catch (error) {
    // Le son est un confort d'alerte; une erreur audio ne doit pas bloquer l'app.
  }
}
