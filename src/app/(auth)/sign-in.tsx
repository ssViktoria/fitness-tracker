import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthActions } from "@convex-dev/auth/react";
import { TextField } from "../../components/TextField";
import { EMAIL_RE } from "../../utils/validation";

type Errors = { email?: string; password?: string; form?: string };

export default function SignInScreen() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e: Errors = {};
    if (!EMAIL_RE.test(email.trim())) e.email = "Введіть коректний email";
    if (password.length < 8) e.password = "Мінімум 8 символів";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: "signIn",
      });
    } catch {
      setErrors({ form: "Невірний email або пароль" });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-1 text-3xl font-bold text-text dark:text-text-dark">
            FitPulse 💪
          </Text>
          <Text className="mb-8 text-base text-text-muted">
            Увійдіть, щоб продовжити тренування
          </Text>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email}
          />
          <TextField
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            error={errors.password}
          />

          {errors.form ? (
            <Text className="mb-3 text-center text-danger">{errors.form}</Text>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={loading}
            className="items-center rounded-xl bg-primary py-4 active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">Увійти</Text>
            )}
          </Pressable>

          <Link href="/sign-up" asChild>
            <Pressable className="mt-6 items-center">
              <Text className="text-text-muted">
                Немає акаунта? <Text className="font-semibold text-primary">Зареєструватися</Text>
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}