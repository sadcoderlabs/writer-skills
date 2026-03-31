# 寫作規則

用來抵制常見 AI 寫作模式的規則，確保文章讀起來像是作者自己寫的。

## 禁止模式

這些模式是 AI 生成文字的明顯特徵。完全避免使用。

### 句子層級
- **破折號連接的對比句**：「不是 A——而是 B」、「不是 A——其實是 B」。改寫成兩個獨立的句子或使用不同的結構。

<example type="bad">
It's not about replacing you — it's about helping you think.
</example>

<example type="good">
AI can't write for you. But it can ask the right questions when your ideas are still blurry.
</example>

- **「不是 A，而是 B」**：被濫用的對比公式。換一種方式來表達。

（和破折號連接的對比句是同一種模式。參見上方的例子。）

- **空洞的開場提問**：「你有沒有想過...？」、「如果我告訴你...？」。改用具體的陳述或故事開場。

<example type="bad">
If AI can't write good articles on its own, what can it actually help with?
</example>

<example type="good">
AI can't write well. That much is clear. But it's not entirely useless either.
</example>

- **填充片語**：「事實上」、「值得一提的是」、「結果發現」、「有趣的是」。刪掉它們——它們不提供任何資訊。

<example type="bad">
Interestingly enough, this set of writing skills was itself designed with AI assistance.
</example>

<example type="good">
This set of writing skills was itself designed with AI assistance.
</example>

### 段落層級
- **段落結尾的總結句**：不要重述該段落剛剛說過的內容。以最後一個實質論點收尾，或讓下一段自然銜接。

<example type="bad">
The first trick is turning up extended thinking. The second is giving it a three-act structure. The third is setting the audience and goals upfront.
All three share a common thread: they're things you need to do before writing starts.
</example>

<example type="good">
The first trick is turning up extended thinking. The second is giving it a three-act structure. The third is setting the audience and goals upfront.
I found that skipping any of these meant the draft was unfixable no matter how many revisions I tried.
</example>

結尾的句子應該推進到下一個想法，而不是重述剛才說的。

- **過場填充語**：「讓我們深入了解」、「接下來，讓我們看看」、「讓我們探索」、「接著來到」。直接開始下一段就好——標題本身就提供了轉場。
- **跨段落的重複**：每段都必須推進文章。如果某一段在重述前一段說過的內容，將它們合併或刪除重複的部分。

<example type="bad">
(Paragraph 2) This idea became the core philosophy behind the writing skills.
(Paragraph 4) Preparation is what really determines article quality.
(Paragraph 6) Get your materials ready, set the audience and goals, then write.
All three say "preparation matters." By the third time, the reader has stopped caring.
</example>

<example type="good">
State the point once. Each later mention must add something new: a different angle, a concrete method, or a counterexample. If there's nothing new to add, don't bring it up again.
</example>

- **抽象的結論句**：不要用模糊的結論來結束一個論點，例如「這徹底改變了我的做法」或「這個區別很重要」。讀者什麼都學不到。改用具體的結果、例子或後果，讓讀者看到到底改變了什麼。

<example type="bad">
The preparation phase determines content quality, while the writing phase determines expression. This distinction changed the entire direction of my system design.
</example>

<example type="good">
Beyond writing technique, pre-writing preparation is a major factor. This shaped my design approach: extract raw materials first, then let AI do the writing.
</example>

結尾應該呈現具體改變了什麼，而不是只是宣稱有改變。

### 結構層級
- **非列表內容使用條列結構**：當散文敘述更自然時，不要硬把內容塞進編號列表。

<example type="bad">
First, turn extended thinking up to high. AI gets more room to think about structure and the output improves significantly.

Second, give it a three-act structure. Essays need narrative arc, and a framework helps AI arrange paragraphs with better pacing.

Third, set the audience and goals before writing.
</example>

<example type="good">
The biggest improvement came from turning extended thinking up to high — with room to plan, AI stops producing bullet-point-style reports. Essays also need arc, so I started giving it a three-act framework for pacing. But none of this works unless you first tell it who the reader is and what they should walk away with.
</example>

將各項目用因果關係織入散文中，而不是孤立的編號條目。

- **過多的破折號**：每篇文章保持 1-2 個以內。其餘改用逗號、句號，或拆成獨立的句子。

<example type="bad">
The tool — which we built in two weeks — handled three tasks — parsing, validation, and routing — without any manual config.
</example>

<example type="good">
The tool handled three tasks without any manual config: parsing, validation, and routing. We built it in two weeks.
</example>

- **對稱式段落**：不是每個段落都需要相同的長度或結構。結構由內容決定。

## 品質要求

### 使用作者的素材
- 文章中的每個聲明、例子和數字都必須來自大綱的素材。素材包括作者提供的內容（來自訪談）和作者已確認納入的研究成果（來自 research.md）。絕不編造例子、統計數據或軼事。
- 如果某個段落的素材不夠充分，向作者提出來，而不是用籠統的陳述來湊字數。

### 保留語氣
- 當作者的原始用詞生動或有特色時，保留它們。不要把口語化的表達潤成正式的文體，除非風格參考明確要求這樣做。
- 符合風格參考的語調和語域。如果沒有風格參考，預設為直接而口語化的風格。

### 要具體
- 用數字而非形容詞：「快 3 倍」而不是「大幅提升」
- 用名稱而非類別：「我們用了 Redis」而不是「我們用了一個快取方案」
- 用故事而非摘要：「上線第一天，部署就失敗了，因為...」而不是「我們遇到了一些初期的挑戰」

### 引用來源要附連結
- 當文章引用了來自 `research.md` 或 `brief.md` 素材中的數據、統計、研究成果或聲明時，附上 Markdown 連結指向來源。
- 在行文中自然地使用行內連結：「根據[官方文件](https://...)」或「一項 [2024 年的調查](https://...) 發現...」
- 如果來源網址可以在 `research.md` 或素材中找到，就使用它。不要編造網址。
- 不是每個句子都需要連結——連結關鍵數據，不需要連結常識或作者自己的觀點/經驗。

### 推進，不重複
- 每段都應該推動文章前進。讀者在每一段都應該學到新東西。
- 如果你發現自己在重述一個論點，那你不是在湊字數，就是大綱有結構上的問題。

### 讓抽象概念變得具體
- 解釋抽象概念或方法論時，使用比喻或具體的感官經驗，讓讀者能夠*感受*到，而不只是理解。
- 一個好的比喻能讓讀者有所感。搭配他們能夠認同的具體情緒或身體情境。

<example type="bad">
Instead of making AI write better, I shifted to helping authors extract the materials from their minds.
</example>

<example type="good">
Through Q&A, extract the author's experiential materials — use these as raw ingredients and let AI cook them into a dish. Find the article's "soul": maybe it's the frustration of debugging for half a day only to find a trivial fix, or the satisfaction of changing one line and watching everything work.
</example>
