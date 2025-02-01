import statsFlattened from "../data/flat_stats.json"

for (const val of Object.values(statsFlattened)) {
    console.log(val)
    break;
}
