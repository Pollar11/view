import { useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { AuthShell } from '@/features/auth/AuthShell';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Txt } from '@/components/Txt';
import { palette, space } from '@/theme/tokens';
import { useLoginMutation } from '@/store/api';
import { persistSession } from '@/store';
import { errMessage } from '@/lib/errors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();

  const submit = async () => {
    setError(null);
    try {
      const res = await login({ email: email.trim(), password }).unwrap();
      await persistSession(res);
    } catch (e) {
      setError(errMessage(e, 'Could not sign you in.'));
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Welcome back.">
      <View style={{ gap: space.lg }}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {error ? (
          <Txt variant="meta" color={palette.danger}>
            {error}
          </Txt>
        ) : null}
        <Button label="Sign in" onPress={submit} loading={isLoading} full />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Txt variant="meta" color={palette.textDim}>
            New here?
          </Txt>
          <Link href="/(auth)/register">
            <Txt variant="meta" color={palette.text}>
              Create an account
            </Txt>
          </Link>
        </View>
      </View>
    </AuthShell>
  );
}
