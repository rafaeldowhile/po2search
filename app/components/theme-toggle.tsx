import { Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { Button } from "~/components/ui/button";

const iconTransformOrigin = { transformOrigin: "50% 100px" };

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  const toggleTheme = () => 
    setTheme((theme) => (theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative w-9 h-9 group"
    >
      <div className="relative overflow-hidden h-full w-full">
        <span
          className={`absolute flex items-center justify-center inset-0 transform transition-all duration-500 ${
            theme === Theme.LIGHT ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
          }`}
          style={iconTransformOrigin}
        >
          <Moon className="h-[1.2rem] w-[1.2rem] text-muted-foreground group-hover:text-foreground transition-colors" />
        </span>
        <span
          className={`absolute flex items-center justify-center inset-0 transform transition-all duration-500 ${
            theme === Theme.DARK ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          }`}
          style={iconTransformOrigin}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] text-muted-foreground group-hover:text-foreground transition-colors" />
        </span>
      </div>
    </Button>
  );
} 