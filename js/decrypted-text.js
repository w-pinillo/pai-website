class DecryptedText {
  constructor(
    el,
    {
      speed = 50,
      maxIterations = 10,
      sequential = false,
      revealDirection = 'start',
      useOriginalCharsOnly = false,
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
      animateOn = 'hover',
    } = {}
  ) {
    this.el = el
    this.text = el.textContent
    this.speed = speed
    this.maxIterations = maxIterations
    this.sequential = sequential
    this.revealDirection = revealDirection
    this.useOriginalCharsOnly = useOriginalCharsOnly
    this.characters = characters
    this.animateOn = animateOn

    this.displayText = this.text
    this.isHovering = false
    this.isScrambling = false
    this.revealedIndices = new Set()
    this.hasAnimated = false
    this.interval = null
    this.currentIteration = 0

    this.init()
  }

  init() {
    if (this.animateOn === 'hover') {
      this.el.addEventListener('mouseenter', () => this.startScrambling())
      this.el.addEventListener('mouseleave', () => this.stopScrambling())
    } else if (this.animateOn === 'view') {
      this.setupIntersectionObserver()
    }
  }

  setupIntersectionObserver() {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.startScrambling()
          this.hasAnimated = true
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    })
    observer.observe(this.el)
  }

  startScrambling() {
    if (this.isScrambling) return
    this.isHovering = true
    this.isScrambling = true
    this.currentIteration = 0
    this.revealedIndices = new Set()

    this.interval = setInterval(() => {
      if (this.sequential) {
        this.revealNextCharacter()
      } else {
        this.scrambleAll()
      }
    }, this.speed)
  }

  stopScrambling() {
    this.isHovering = false
    this.isScrambling = false
    clearInterval(this.interval)
    this.el.textContent = this.text
  }

  revealNextCharacter() {
    if (this.revealedIndices.size >= this.text.length) {
      clearInterval(this.interval)
      this.isScrambling = false
      this.el.textContent = this.text
      return
    }

    const nextIndex = this.getNextIndex()
    this.revealedIndices.add(nextIndex)
    this.el.textContent = this.shuffleText(this.text, this.revealedIndices)
  }

  scrambleAll() {
    this.currentIteration++
    if (this.currentIteration >= this.maxIterations) {
      clearInterval(this.interval)
      this.isScrambling = false
      this.el.textContent = this.text
      return
    }
    this.el.textContent = this.shuffleText(this.text, new Set())
  }

  getNextIndex() {
    const textLength = this.text.length
    switch (this.revealDirection) {
      case 'start':
        return this.revealedIndices.size
      case 'end':
        return textLength - 1 - this.revealedIndices.size
      case 'center':
        const middle = Math.floor(textLength / 2)
        const offset = Math.floor(this.revealedIndices.size / 2)
        const nextIndex =
          this.revealedIndices.size % 2 === 0
            ? middle + offset
            : middle - offset - 1
        if (
          nextIndex >= 0 &&
          nextIndex < textLength &&
          !this.revealedIndices.has(nextIndex)
        ) {
          return nextIndex
        }
        for (let i = 0; i < textLength; i++) {
          if (!this.revealedIndices.has(i)) return i
        }
        return 0
      default:
        return this.revealedIndices.size
    }
  }

  shuffleText(originalText, currentRevealed) {
    const availableChars = this.useOriginalCharsOnly
      ? Array.from(new Set(originalText.split(''))).filter(
        (char) => char !== ' '
      )
      : this.characters.split('')

    return originalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' '
        if (currentRevealed.has(i)) return originalText[i]
        return availableChars[
          Math.floor(Math.random() * availableChars.length)
        ]
      })
      .join('')
  }
}
