"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  // Dans le useEffect de ProtectedRoute.tsx
  useEffect(() => {
    // On vérifie si le cookie "token" existe (peu importe sa valeur, c'est la Gateway qui validera le contenu lors des appels API)
    const cookies = document.cookie.split('; ');
    const tokenExists = cookies.some(c => c.startsWith('token='));

    if (!tokenExists) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Si on n'est pas encore autorisé, on affiche rien (ou un petit chargement)
  if (!authorized) return <div className="p-10 text-center">Vérification des accès...</div>;

  return <>{children}</>;
}

