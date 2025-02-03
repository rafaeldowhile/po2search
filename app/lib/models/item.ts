import { ItemProperties } from "../searchv2";
import { DamageRange, ItemHeader, ItemRequirements, ModLine } from "../types";

export class Item {
    public header: ItemHeader | null = null;
    public sockets: string[] | null = null;
    public requirements: ItemRequirements | null = null;
    public properties: ItemProperties | null = null;
    public mods: ModLine[] | null = null;

    private calculateValueWithQuality(value: number): number {
        if (!this.properties?.quality || this.properties.quality >= 20) {
            return value;
        }

        // Calculate base value at 0% quality
        const baseValue = Math.round(value / (1 + this.properties.quality / 100));
        // Adjust for 20% quality
        return Math.floor(baseValue * 1.2);
    }

    public getPhysicalDamageWithQuality(): DamageRange | null {
        if (!this.properties?.physicalDamage) return null;

        return {
            min: this.calculateValueWithQuality(this.properties.physicalDamage.min),
            max: this.calculateValueWithQuality(this.properties.physicalDamage.max),
        };
    }

    public getPhysicalDps(): number | null {
        if (!this.properties?.physicalDamage || !this.properties?.attackSpeed) return null;
        return this.getDps(this.properties?.physicalDamage, this.properties.attackSpeed);
    }

    public getPhysicalDpsWithQuality(): number | null {
        const physDmgWithQuality = this.getPhysicalDamageWithQuality();
        if (!physDmgWithQuality || !this.properties?.attackSpeed) return null;
        return this.getDps(physDmgWithQuality, this.properties.attackSpeed);
    }

    public getElementalDps(): number | null {
        if (!this.properties?.attackSpeed) return null;

        let total = 0;
        if (this.properties?.fireDamage) total += this.getDps(this.properties.fireDamage, this.properties.attackSpeed);
        if (this.properties?.coldDamage) total += this.getDps(this.properties.coldDamage, this.properties.attackSpeed);
        if (this.properties?.lightningDamage) total += this.getDps(this.properties.lightningDamage, this.properties.attackSpeed);

        return total || null;
    }

    public getChaosDps(): number | null {
        if (!this.properties?.chaosDamage || !this.properties?.attackSpeed) return null;
        return this.getDps(this.properties.chaosDamage, this.properties.attackSpeed);
    }

    public getTotalDps(): number | null {
        const physDps = this.getPhysicalDps() ?? 0;
        const eleDps = this.getElementalDps() ?? 0;
        const chaosDps = this.getChaosDps() ?? 0;

        const total = physDps + eleDps + chaosDps;
        return total || null;
    }

    public getTotalDpsWithQuality(): number | null {
        const physDps = this.getPhysicalDpsWithQuality() ?? 0;
        const eleDps = this.getElementalDps() ?? 0;
        const chaosDps = this.getChaosDps() ?? 0;

        const total = physDps + eleDps + chaosDps;
        return total || null;
    }

    public getTotalDamage(): number | null {
        let total = 0;

        if (this.properties?.physicalDamage) {
            total += (this.properties.physicalDamage.min + this.properties.physicalDamage.max) / 2;
        }
        if (this.properties?.fireDamage) {
            total += (this.properties.fireDamage.min + this.properties.fireDamage.max) / 2;
        }
        if (this.properties?.coldDamage) {
            total += (this.properties.coldDamage.min + this.properties.coldDamage.max) / 2;
        }
        if (this.properties?.lightningDamage) {
            total += (this.properties.lightningDamage.min + this.properties.lightningDamage.max) / 2;
        }
        if (this.properties?.chaosDamage) {
            total += (this.properties.chaosDamage.min + this.properties.chaosDamage.max) / 2;
        }

        return total || null;
    }

    public getTotalDamageWithQuality(): number | null {
        let total = 0;
        const physDmgWithQuality = this.getPhysicalDamageWithQuality();

        if (physDmgWithQuality) {
            total += (physDmgWithQuality.min + physDmgWithQuality.max) / 2;
        }
        if (this.properties?.fireDamage) {
            total += (this.properties.fireDamage.min + this.properties.fireDamage.max) / 2;
        }
        if (this.properties?.coldDamage) {
            total += (this.properties.coldDamage.min + this.properties.coldDamage.max) / 2;
        }
        if (this.properties?.lightningDamage) {
            total += (this.properties.lightningDamage.min + this.properties.lightningDamage.max) / 2;
        }
        if (this.properties?.chaosDamage) {
            total += (this.properties.chaosDamage.min + this.properties.chaosDamage.max) / 2;
        }

        return total || null;
    }

    public getArmourWithQuality(): number | null {
        if (!this.properties?.armour) return null;
        return this.calculateValueWithQuality(this.properties.armour);
    }

    public getEnergyShieldWithQuality(): number | null {
        if (!this.properties?.energyShield) return null;
        return this.calculateValueWithQuality(this.properties.energyShield);
    }

    public getEvasionWithQuality(): number | null {
        if (!this.properties?.evasion) return null;
        return this.calculateValueWithQuality(this.properties.evasion);
    }

    public getBlockWithQuality(): number | null {
        if (!this.properties?.block) return null;
        return this.calculateValueWithQuality(this.properties.block);
    }

    public getDps(damage: DamageRange, attacksPerSecond: number): number {
        return Math.round(((damage.min + damage.max) / 2) * attacksPerSecond);
    }
}