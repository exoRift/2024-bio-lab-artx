import { terminal } from 'terminal-kit'
import { setTimeout } from 'timers/promises'

import dictionary from './codons.json' with { type: 'json' }

const backwardConversions = {
  A: 'T',
  U: 'A',
  C: 'G',
  G: 'C'
}
const forwardConversions = {
  A: 'U',
  T: 'A',
  C: 'G',
  G: 'C'
}

const TABLE = 'https://microbenotes.com/wp-content/uploads/2023/09/Codon-Chart-and-Codon-Table.jpeg'

function shuffle (array: any[]): void {
  for (let i = 0; i < array.length; ++i) {
    const newPos = Math.round(Math.random() * (array.length - 1))

    let old: any = array[newPos]
    array[newPos] = array[i]
    array[i] = old
  }
}

const sequence: string[] = []
const acidCount = Math.round((Math.random() * 6) + 3)
const bases: string[] = []
const hints: string[] = []

for (let a = 0; a < acidCount; ++a) {
  const acid = dictionary[Math.round(Math.random() * (dictionary.length - 1))]

  sequence.push(acid.acid)
  const code = acid.codes[Math.round(Math.random() * (acid.codes.length - 1))]
  hints.push(code)
  bases.push(...code)
}

shuffle(bases)
for (let b = 0; b < bases.length; ++b) bases[b] = backwardConversions[bases[b] as 'A' | 'U' | 'C' | 'G']

function timesUsed (base: string): number {
  let used = 0
  for (const letter of typed) {
    if (letter === base) ++used
  }

  return used
}

const typed: string[] = []
function display (): void {
  terminal.clear()

  terminal.moveTo(1, terminal.height)
  for (let b = 0; b < bases.length; ++b) {
    const base = bases[b]
    let number = 1
    for (let i = 0; i < b; ++i) {
      if (bases[i] === base) ++number
    }

    const used = timesUsed(base)

    terminal[used < number ? 'green' : 'red'](base)
  }

  terminal.styleReset()
  terminal.moveTo(1, 1)
  terminal('The codon table can be found at: %s\n', TABLE)
  terminal('Enter a codon transcription sequence to satisfy the Amino Acid pattern when translated: \n%s\n\n> %s', sequence.join(' '), typed.join('').replace(/(.{3})/g, '$1 '))
}

let listening = true
async function onInput (key: string): Promise<void> {
  if (!listening) return

  key = key.toUpperCase()

  if (key === 'CTRL_C' || key === 'Q') process.exit(0)
  else if (key === 'BACKSPACE' && typed.length) typed.splice(-1, 1)
  else if (key === 'H') {
    const hint = hints[Math.round(Math.random() * (hints.length - 1))]

    terminal.gray('%s', hint)
    listening = false
    await setTimeout(1000)
    listening = true
  } else if (key === 'ENTER' && typed.length === bases.length) {
    const builtSequence: string[] = []

    for (let c = 0; c < typed.length; c += 3) {
      const codon = typed.slice(c, c + 3)
      for (let b = 0; b < 3; ++b) codon[b] = forwardConversions[codon[b] as 'A' | 'T' | 'C' | 'G']

      const acid = dictionary.find((a) => a.codes.includes(codon.join('')))

      builtSequence.push(acid?.acid ?? '???')
    }

    let differ = false
    for (let a = 0; a < sequence.length; ++a) {
      if (builtSequence[a] !== sequence[a]) {
        differ = true
        break
      }
    }

    terminal('\nConstructed: %s\n', builtSequence.join(' '))
    if (differ) {
      listening = false
      terminal.red('!!!ERROR!!! Sequence doesn\'t match!')
      await setTimeout(1000)
      listening = true
    } else {
      listening = false
      terminal.green('SUCCESS! Sequence constructed!')
      await setTimeout(1000)
      process.exit(0)
    }
  } else if (bases.includes(key)) {
    const used = timesUsed(key)

    let count = 0
    for (let b = 0; b < bases.length; ++b) {
      if (bases[b] === key) ++count
    }

    if (used < count) typed.push(key.toUpperCase())
  }

  display()
}

terminal.fullscreen(false)
display()
terminal.grabInput(true)
terminal.on('key', onInput)
