import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthActions } from "@convex-dev/auth/react";
import { TextField } from "../../components/TextField";
import { EMAIL_RE } from "../../utils/validation";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
};

export default function SignUpScreen() {
  const { signIn } = useAuthActions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Введіть ім'я (мінімум 2 символи)";
    if (!EMAIL_RE.test(email.trim())) e.email = "Введіть коректний email";
    if (password.length < 8) e.password = "Мінімум 8 символів";
    if (confirm !== password) e.confirm = "Паролі не збігаються";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await signIn("password", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        flow: "signUp",
      });
    } catch {
      setErrors({
        form: "Не вдалося зареєструватися. Можливо, цей email вже використовується",
      });
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
            Створити акаунт
          </Text>
          <Text className="mb-8 text-base text-text-muted">
            Почніть відстежувати свій прогрес
          </Text>

          <TextField
            label="Ім'я"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />
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
            error={errors.password}
          />
          <TextField
            label="Повторіть пароль"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            error={errors.confirm}
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
              <Text className="text-base font-semibold text-white">
                Зареєструватися
              </Text>
            )}
          </Pressable>

          <Link href="/sign-in" asChild>
            <Pressable className="mt-6 items-center">
              <Text className="text-text-muted">
                Вже є акаунт? <Text className="font-semibold text-primary">Увійти</Text>
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}