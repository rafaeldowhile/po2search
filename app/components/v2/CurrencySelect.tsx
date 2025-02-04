import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import currencies from '~/data/currency.json';

interface CurrencySelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

export const CurrencySelect = ({ value, onValueChange }: CurrencySelectProps) => {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
                {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                        <div className="flex items-center gap-2">
                            <img 
                                src={`https://web.poecdn.com${currency.image}`} 
                                alt={currency.text} 
                                className="w-4 h-4"
                            />
                            {currency.text}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
