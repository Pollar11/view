import { useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { AuthShell } from '@/features/auth/AuthShell';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Txt } from '@/components/Txt';
import { palette, space } from '@/theme/tokens';
import { useRegisterMutation } from '@/store/api';
import { persistSession } from '@/store';
import { errMessage } from '@/lib/errors';

export default function Register() {
  const [displayName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [register, { isLoading }] = useRegisterMutation();

  const submit = async () => {
    setError(null);
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    try {
      const res = await register({ displayName: displayName.trim(), email: email.trim(), password }).unwrap();
      await persistSession(res);
    } catch (e) {
      setError(errMessage(e, 'Could not create your account.'));
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Takes ten seconds. No card, no spam.">
      <View style={{ gap: space.lg }}>
        <Field label="Name" value={displayName} onChangeText={setName} autoCapitalize="words" />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          onSubmitEditing={submit}
        />
        <Txt variant="meta" color={palette.textFaint}>
          At least 8 characters, with a letter and a number.
        </Txt>
        {error ? (
          <Txt variant="meta" color={palette.danger}>
            {error}
          </Txt>
        ) : null}
        <Button label="Create account" onPress={submit} loading={isLoading} full />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Txt variant="meta" color={palette.textDim}>
            Already have one?
          </Txt>
          <Link href="/(auth)/login">
            <Txt variant="meta" color={palette.text}>
              Sign in
            </Txt>
          </Link>
        </View>
      </View>
    </AuthShell>
  );
}
