import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { APP_NAME } from '@/lib/constants';
import { toast } from 'sonner';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // 新規登録
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('確認メールを送信しました。メール内のリンクをクリックしてください。');
      } else {
        // ログイン
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('ログインしました');
      }
    } catch (error: any) {
      toast.error(error.message || '認証エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
          <CardDescription>
            {isSignUp ? '新しいアカウントを作成' : 'アカウントにログイン'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '処理中...' : isSignUp ? '登録する' : 'ログイン'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-muted-foreground hover:text-primary transition-colors underline"
              type="button"
            >
              {isSignUp
                ? 'すでにアカウントをお持ちの場合はこちら'
                : 'アカウントをお持ちでない場合はこちら'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
