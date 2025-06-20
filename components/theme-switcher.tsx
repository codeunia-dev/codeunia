"use client";

import { Button } from "@/components/ui/button";

import { Moon} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <Button variant="ghost" size={"sm"} onClick={() => setTheme('dark')}>
      <Moon key="dark" size={ICON_SIZE} className={"text-muted-foreground"} />
      <span className="sr-only">Dark mode only</span>
    </Button>
  );
};

export { ThemeSwitcher };
