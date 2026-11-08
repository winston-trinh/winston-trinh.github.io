import { Mermaid } from '../Mermaid'
import { TEST_COUNT as N } from '../posts'
import styles from '../Blog.module.css'

const ARCHITECTURE = `flowchart LR
  subgraph prep["The kitchen: done once, ahead of time"]
    photo["Original portrait"] --> ai[("AI face model")]
    ai --> frames["121 gaze photos"]
    content["Resume content file"]
  end
  subgraph browser["The table: your browser"]
    content --> page["Portfolio page"]
    frames --> face["Interactive face"]
    face --> page
  end`

const SLIDER = `flowchart TB
  subgraph before["Before: every nudge of the slider"]
    direction LR
    b1["Redraw the top of the page"] --> b2["Rebuild the glass lens"] --> b3["Some buttons fade in late"]
  end
  subgraph after["After: every nudge of the slider"]
    direction LR
    a1["Change one setting"] --> a2["Every pane updates in the same frame"]
  end
  before ~~~ after`

const PIPELINE = `flowchart LR
  push["I publish a change"] --> tests{"Run all ${N} tests"}
  tests -- "All pass" --> build["Build the site"] --> live["Go live"]
  tests -- "Any fail" --> stop["Turned away. Nothing changes"]`

function Figure({ n, caption, children }: { n: number; caption: string; children: React.ReactNode }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>{children}</div>
      <figcaption>
        <b>Figure {n}.</b> {caption}
      </figcaption>
    </figure>
  )
}

export function BuildingAPortfolio() {
  return (
    <>
      <p className={styles.lead}>
        Here’s a fun fact about recruiters: they look at a lot of portfolios, and after a while the lists of jobs and
        skills blend together. So when I rebuilt mine this fall, I gave myself one goal. Make people smile in the first
        second, then get out of their way.
      </p>
      <p>
        My answer was a photo of me that watches your cursor. Move your mouse left and I look left. Then I dressed the
        rest of the site in glass, borrowing Apple’s newest look. Here’s how both work, and the quieter testing that
        keeps it all from falling over.
      </p>

      <h2>The whole site in one picture</h2>
      <p>
        Think of a restaurant. The cooking happens in the kitchen before you arrive, and you only get the finished
        plate. The slow work, like creating the photos, happens once on my computer, so your browser just receives
        finished files and the page loads quickly. Every word on the site lives in a single file, so updating my resume
        never means rearranging the page.
      </p>
      <Figure n={1} caption="Heavy lifting happens in the kitchen. Your browser only plates the dish.">
        <Mermaid chart={ARCHITECTURE} label="Diagram: the portrait goes through an AI face model once to make 121 gaze photos. In the browser, those photos and the resume content file make up the portfolio page." />
      </Figure>

      <h2>121 selfies and a flipbook</h2>
      <p>
        Remember flipbooks? The face works the same way. I made 121 photos of myself, each looking a slightly different
        direction, arranged like an 11 by 11 checkerboard. When you move your mouse, the site flips to the photo looking
        closest to your cursor. They load quietly in the background, so they’re ready before you move.
      </p>
      <Figure n={2} caption="Nine of the 121 photos. The one in the middle is the real, unedited me.">
        <img
          className={styles.grid}
          src="/blog/gaze-grid.webp"
          alt="Nine portraits of Winston in a three by three grid. In each one his eyes and head point toward that position: up-left in the top-left image, straight ahead in the center, down-right in the bottom-right."
          width={768}
          height={768}
          loading="lazy"
        />
      </Figure>

      <h3>Version one: the googly eyes</h3>
      <p>
        My first attempt skipped AI. A program found the colored part of my eyes and slid it a few pixels left or right.
        But I’m smiling in my photo, so there was barely room to move, and real people don’t just move their eyes. Their
        heads turn and their eyebrows rise. The effect was less “friendly engineer” and more “haunted portrait in a
        museum.” So I switched to an AI model that edits faces, turning the head, gaze and expression from one real
        photo. I kept every change small. Push it too far and it stops looking like me.
      </p>

      <h2>Made of glass</h2>
      <p>
        With the face doing the showing off, everything else needed to stay calm. Apple’s new Liquid Glass look fit
        perfectly: buttons, tabs, the search bar and the dark mode switch float over the page like panes of glass,
        bending and frosting whatever scrolls underneath. I built them with glisse, an open-source library that
        recreates the effect for the web.
      </p>
      <p>
        Under my face, a slider sets how see-through the glass is, from clear to frosted, and every pane changes at once
        while my eyes follow your cursor. I stopped “clear” short of invisible, because glass you can’t read through is
        just a pretty way to hide a button.
      </p>
      <Figure n={3} caption="The same floating bar over the same headline. Frosted hides what’s underneath. Clear lets it show, but never vanishes.">
        <img
          className={styles.shot}
          src="/blog/glass-slider.webp"
          alt="Two strips of the site's floating navigation bar over the headline Where I've worked. In the frosted strip the headline is hidden behind the bar. In the clear strip it shows through the glass."
          width={1200}
          height={236}
          loading="lazy"
        />
      </Figure>

      <h3>Search that answers instantly</h3>
      <p>
        Type “education” into the glass search bar and USC pops up with my degree. Type “experience” and my jobs line
        up newest first. The rest of the page melts into a blur so the answer is the only thing in focus, and picking a
        result takes you there.
      </p>
      <Figure n={4} caption="Searching “education.” The page blurs so the answer is the only thing in focus.">
        <img
          className={styles.shot}
          src="/blog/glass-search.webp"
          alt="The portfolio with its search bar open. The query education shows the University of Southern California with the degree and graduation date. The rest of the page is blurred."
          width={1200}
          height={680}
          loading="lazy"
        />
      </Figure>

      <h3>Finishing your sentence</h3>
      <p>
        Search also tries to finish your thought. Type “exp” and the rest of “experience” appears in light gray, ready
        for Tab, like your phone’s keyboard. It only suggests when it’s sure, and on a narrow phone a long suggestion
        becomes a tappable line instead.
      </p>
      <p>
        It forgives typos, too. When a search finds nothing, the site compares your word against every word it knows,
        counting the keystrokes needed to fix it. Fat fingers usually hit the key next door, so an “r” for a “t” counts
        as half a mistake. Type “educarion” and it asks “Did you mean ‘education’?” with USC already showing.
      </p>
      <Figure n={5} caption="Top: Tab finishes “exp” as “experience.” Bottom: a fat-fingered “educarion” still finds my degree.">
        <img
          className={styles.shot}
          src="/blog/search-suggestions.webp"
          alt="Two search examples. In the first, the typed letters exp are followed by the gray suggestion erience and a small tab key hint. In the second, the misspelled query educarion shows Did you mean education, with the University of Southern California result below."
          width={600}
          height={540}
          loading="lazy"
        />
      </Figure>

      <h3>Projects in folders</h3>
      <p>
        My projects live in folders, one per month, like the Downloads stack on a Mac. Each folder’s frosted front hints
        at the screenshots inside. Point at one and they rise out while the folder shows the details.
      </p>
      <Figure n={6} caption="October 2023 holds two projects. Their screenshots rise out, and the front shows the one you picked.">
        <img
          className={styles.shot}
          src="/blog/glass-folders.webp"
          alt="Two project folders. The October 2023 folder is open, with screenshots of Traveling Trojan and Cache Simulator rising out of it and Cache Simulator's description on the folder's frosted front."
          width={984}
          height={485}
          loading="lazy"
        />
      </Figure>

      <h2>Quality: the part nobody sees</h2>
      <p>This is the part I’m proudest of, and no visitor will ever notice it. That’s kind of the point.</p>

      <h3>{N} tiny robot testers</h3>
      <p>
        Imagine {N} very patient interns whose only job is to use your website and report anything strange. That’s what
        automated tests are, minus the coffee budget. One moves the mouse to the top corner and checks that I look up.
        One makes sure all 121 photos exist. Others flip dark mode, search “educarion” to make sure USC still shows up,
        and confirm the email button fills in the subject line. All {N} run in seconds whenever I change anything.
      </p>

      <h3>The bugs they caught</h3>
      <p>
        When I went from 49 photos to 121, three testers raised their hands. They had the old number memorized. Instead
        of teaching them the new one, I taught them to look it up where the website does, so they’ll keep up on their
        own. I also sent a robot through a real copy of Chrome at laptop and phone sizes. It caught search results
        sliding 45 pixels off a phone screen and blog links landing on the wrong spot. Both are fixed.
      </p>

      <h3>Measure twice, generate once</h3>
      <p>
        The AI charges per photo, so I ordered one first and checked that “look up” actually looked up. Then, starting
        the full batch, the program said “72 to generate.” I expected 121. It turned out it was about to keep 49 photos
        from the googly-eye version because they shared file names, so a third of my face grid would have been the
        haunted portrait. I cleared them out and started fresh.
      </p>

      <h3>When the AI said “slow down”</h3>
      <p>
        The AI service only takes so many requests a minute, like a coffee shop during the morning rush, and 23 photos
        didn’t make it. Luckily, the program remembered what it had finished, so running it again ordered only the
        missing 23.
      </p>

      <h3>The slider that stuttered</h3>
      <p>
        Every test passed, and the glass slider still felt sticky. So I measured it. Each grab froze the page for up to
        134 milliseconds while the library rebuilt a fancy glass lens, and some buttons faded in a beat after the
        others. I swapped in a simpler slider the browser moves on its own and had every pane read one shared setting.
        Now everything updates together, in the same frame.
      </p>
      <Figure n={7} caption="The fix: one setting, read by every pane of glass in the same frame.">
        <Mermaid chart={SLIDER} label="Diagram: before, every nudge of the slider redrew the top of the page and rebuilt the glass lens, so some buttons faded in late. After, every nudge changes one setting and every glass surface updates in the same frame." />
      </Figure>

      <h3>A bouncer at the door</h3>
      <p>
        All of this only helps if it runs every time, including when I forget. So every update has to pass all {N} tests
        before it reaches the live site. One failure, and the bouncer turns it away.
      </p>
      <Figure n={8} caption="The bouncer. Updates go live automatically, but only if every test passes.">
        <Mermaid chart={PIPELINE} label={`Diagram: a published change runs all ${N} tests. If all pass, the site is built and goes live. If any fail, nothing changes.`} />
      </Figure>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.num}>{N}</span>
          <span className={styles.label}>tests, run on every change in seconds</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.num}>84 KB</span>
          <span className={styles.label}>of compressed code runs the homepage, glass included</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.num}>134 → 33 ms</span>
          <span className={styles.label}>longest pause while dragging the glass slider</span>
        </div>
      </div>

      <h2>What I learned</h2>

      <h3>Build the simple version, even if it’s wrong</h3>
      <p>
        The googly eyes went straight into the trash, and I’m glad I built them. Watching them fail showed me what
        “realistic” needed, so I knew exactly what to ask the AI for.
      </p>

      <h3>When a number looks off, stop</h3>
      <p>
        “72 to generate” was one short line, easy to ignore. Most bugs don’t arrive with alarms. They show up as
        something slightly odd that nobody questions. Now when a number surprises me, I find out why first.
      </p>

      <h3>Keep every fact in one place</h3>
      <p>
        If a fact lives in two places, one will eventually be wrong. When I grouped my two AT&amp;T roles under one
        heading, I changed one file, and the page and its search both updated.
      </p>

      <h3>Robots check, humans notice</h3>
      <p>
        No test said the slider felt sticky. A person had to drag it and frown. So I check the real page on a real
        screen, and when something feels off, I measure before I guess at a fix.
      </p>

      <h3>Small details are most of the work</h3>
      <p>
        My first photo crop removed my chin. My first USC logo weighed 2.6 MB, and now weighs 20 KB. My first folders
        were too tall, and their screenshots flew sideways instead of rising like paper. None of it was hard. It just
        needed someone to care.
      </p>

      <p>
        Want to see it in person? Head back to the <a href="/">homepage</a>, drag the glass slider and wave your mouse
        around. I’ll be watching. In the friendly way.
      </p>
    </>
  )
}
