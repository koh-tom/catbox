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
      <Card className="w-full max-w-sm rounded-xl shadow-warm border-none bg-card/60 backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-black flex items-center justify-center gap-3 mb-2">
            <img src="/icon.png" alt="Catbox Icon" className="w-10 h-10 rounded-lg shadow-md rotate-[-5deg]" />
            <span className="tracking-tight text-primary">{APP_NAME}</span>
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            {mode === 'signup' && '新しいアカウントを作成しましょう 🐾'}
            {mode === 'login' && 'おかえりなさい！ログインしてください 🐈'}
            {mode === 'reset' && 'パスワードをリセットします'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-5 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1" htmlFor="email">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-md bg-background/50 border-muted-foreground/20 focus:ring-primary/30"
                required
              />
            </div>
            {mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="password">
                    パスワード
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[10px] font-bold text-muted-foreground hover:text-primary underline uppercase tracking-tighter"
                    >
                      パスワードを忘れた？
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-md bg-background/50 border-muted-foreground/20 focus:ring-primary/30"
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full h-12 rounded-md font-bold text-base shadow-md btn-bounce mt-2" disabled={isLoading}>
              {isLoading ? '準備中...' : 
                mode === 'signup' ? '登録を開始する' : 
                mode === 'login' ? 'ログインする' : '再設定メールを送る'}
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
