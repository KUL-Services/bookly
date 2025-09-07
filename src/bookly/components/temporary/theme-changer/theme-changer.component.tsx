'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();

  const [isMounted, setisMounted] = useState(false);

  useEffect(() => {
    setisMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className='flex flex-1 flex-col content-start items-start'>
      The current theme is: {theme}
      <button onClick={() => setTheme('light')} className='text-red-500 dark:text-green-500'>Light Mode</button>
      <button onClick={() => setTheme('dark')} className='text-red-500 dark:text-green-500'>Dark Mode</button>
    </div>
  );
};

export default ThemeChanger;
