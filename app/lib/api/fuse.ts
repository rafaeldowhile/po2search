import Fuse from "fuse.js";
import Patterns from "./stats";

const fuseOptiosn = {
    keys: ['text', 'type'],
    threshold: 0.25,
    includeScore: true,
}

const fuseIndex = Fuse.createIndex(fuseOptions.keys, Patterns);
const fuse = new Fuse(Patterns, fuseOptions, fuseIndex);
