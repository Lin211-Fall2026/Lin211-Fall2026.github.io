import { cpSync, existsSync, mkdirSync } from 'node:fs';

const build = 'CorpusProject/dist';
const destination = '_site/CorpusProject';

if (!existsSync(`${build}/index.html`)) {
  throw new Error('Corpus explorer build not found. Run `npm run build` in CorpusProject before rendering the Quarto site.');
}

mkdirSync(destination, { recursive: true });
cpSync(build, destination, { recursive: true });
