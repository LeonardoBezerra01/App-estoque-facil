import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  };

  const signUp = async (email, password, nomeEmpresa) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nome_empresa: (nomeEmpresa || '').trim() } },
    });
    if (error) throw error;
    return data; // data.session é null quando o projeto exige confirmação de e-mail
  };

  // Atualiza o nome da empresa (guardado nos metadados do usuário no Supabase)
  const updateCompanyName = async (nomeEmpresa) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { nome_empresa: nomeEmpresa.trim() },
    });
    if (error) throw error;
    setSession((prev) => (prev ? { ...prev, user: data.user } : prev));
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut, updateCompanyName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
