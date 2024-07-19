const getEnvVariable = (key: string): string => {
  if (typeof window === 'undefined') {
    // Lado del servidor
    return process.env[key] || '';
  } else {
    // Lado del cliente
    return (window as any).__NEXT_DATA__?.props?.pageProps?.env?.[key] || '';
  }
};

export const config = {
  tursoConnectionUrl: getEnvVariable('NEXT_PUBLIC_TURSO_DATABASE_URL'),
  tursoAuthToken: getEnvVariable('NEXT_PUBLIC_TURSO_AUTH_TOKEN'),
  googleClientId: getEnvVariable('NEXT_PUBLIC_GOOGLE_CLIENT_ID'),
  googleClientSecret: getEnvVariable('NEXT_PUBLIC_GOOGLE_CLIENT_SECRET'),
};

console.log('Configuración cargada:', {
  tursoConnectionUrl: config.tursoConnectionUrl || 'NO CONFIGURADO',
  tursoAuthToken: config.tursoAuthToken ? 'CONFIGURADO (oculto)' : 'NO CONFIGURADO',
  googleClientId: config.googleClientId || 'NO CONFIGURADO',
  googleClientSecret: config.googleClientSecret ? 'CONFIGURADO (oculto)' : 'NO CONFIGURADO',
});

export default config;