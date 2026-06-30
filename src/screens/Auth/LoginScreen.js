import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { COLORS } from '../../config/env'
import { useAuth } from '../../context/AuthContext'
import PrimaryButton from '../../components/PrimaryButton'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Entrez votre email et votre mot de passe.')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      Alert.alert('Connexion impossible', error.response?.data?.message || 'Verifiez vos informations.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SM</Text>
        </View>
        <Text style={styles.title}>Signal Moi</Text>
        <Text style={styles.subtitle}>Alerter, suivre et intervenir depuis le terrain.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#8a9a96"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor="#8a9a96"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <PrimaryButton title="Se connecter" onPress={handleLogin} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.soft,
    padding: 24,
    justifyContent: 'center'
  },
  brand: {
    marginBottom: 34
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18
  },
  logoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900'
  },
  title: {
    color: COLORS.ink,
    fontSize: 36,
    fontWeight: '900'
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    marginTop: 8,
    lineHeight: 23
  },
  form: {
    gap: 14
  },
  input: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.ink
  }
})
