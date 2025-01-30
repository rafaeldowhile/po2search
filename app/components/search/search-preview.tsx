import { Theme, useTheme } from "remix-themes"

export function SearchPreview() {
  const [theme, setTheme] = useTheme();

  // Default to showing moon (light mode) if no theme is set
  const currentTheme = theme || Theme.LIGHT;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <img 
            src={`/assets/${currentTheme === Theme.LIGHT ? 'light' : 'dark'}-query.webp`}
            alt="Search query example"
            className="w-full rounded-lg border shadow-sm"
          />
          <p className="text-sm text-muted-foreground">
            Enter your search query in the search bar
          </p>
        </div>
        
        <div className="space-y-2">
          <img 
            src={`/assets/${currentTheme === Theme.LIGHT ? 'light' : 'dark'}-results.webp`}
            alt="Search results example"
            className="w-full rounded-lg border shadow-sm"
          />
          <p className="text-sm text-muted-foreground">
            View your search results
          </p>
        </div>
      </div>
    </div>
  )
} 