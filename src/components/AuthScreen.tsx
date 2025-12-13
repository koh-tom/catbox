import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { APP_NAME } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('確認メールを送信しました。メール内のリンクをクリックしてください。');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('ログインしました');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        toast.success('パスワード再設定メールを送信しました');
        setMode('login');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '認証エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <img src="/icon.png" alt="Catbox Icon" className="w-8 h-8 rounded-lg shadow-sm" />
            <span>{APP_NAME}</span>
          </CardTitle>
          <CardDescription>
            {mode === 'signup' && '新しいアカウントを作成'}
            {mode === 'login' && 'アカウントにログイン'}
            {mode === 'reset' && 'パスワードを再設定'}
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
            {mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="password">
                    パスワード
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs text-muted-foreground hover:text-primary underline"
                    >
                      パスワードを忘れた場合
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '処理中...' : 
                mode === 'signup' ? '登録する' : 
                mode === 'login' ? 'ログイン' : '再設定メールを送信'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm space-y-2 flex flex-col">
            {mode === 'reset' ? (
              <button
                onClick={() => setMode('login')}
                className="text-muted-foreground hover:text-primary transition-colors underline"
                type="button"
              >
                ログインに戻る
              </button>
            ) : (
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-muted-foreground hover:text-primary transition-colors underline"
                type="button"
              >
                {mode === 'login'
                  ? 'アカウントをお持ちでない場合はこちら'
                  : 'すでにアカウントをお持ちの場合はこちら'}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
