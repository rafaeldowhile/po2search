import { Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { Button } from "~/components/ui/button";

const iconTransformOrigin = { transformOrigin: "50% 100px" };

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  // Default to showing moon (light mode) if no theme is set
  const currentTheme = theme || Theme.LIGHT;

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
        {/* Show Moon in light mode */}
        <span
          className={`absolute flex items-center justify-center inset-0 transform transition-all duration-500 ${
            currentTheme === Theme.LIGHT ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
          }`}
          style={iconTransformOrigin}
        >
          <Moon className="h-[1.2rem] w-[1.2rem] text-muted-foreground group-hover:text-foreground transition-colors" />
        </span>
        {/* Show Sun in dark mode */}
        <span
          className={`absolute flex items-center justify-center inset-0 transform transition-all duration-500 ${
            currentTheme === Theme.DARK ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          }`}
          style={iconTransformOrigin}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] text-muted-foreground group-hover:text-foreground transition-colors" />
        </span>
      </div>
    </Button>
  );
} 