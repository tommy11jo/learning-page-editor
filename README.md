# learning-page-editor

Try it live: https://learning-page-editor.vercel.app/

The learning page editor is a notion-like editor for authoring rich media for course content. It has various rich blocks, including text, headings, multiple choice questions, and Latex AI. The Latex AI generates latex from natural language.

The rich blocks can be accessed by a slash menu. Text can be styled by highlighting it and selecting a style from the hovering bubble menu.

Deployed fastapi app on railway and react + vite app on vercel.

## Tradeoffs

To simplify the database design and focus on the frontend, I assumed:

- there exists only one student and teacher
- there can be only one learning page
- there will be few questions in total (json storage is fine)
- the question id can be created on the client side for convenience

I also focused more on usability and functionality over pretty design (which is important too!).

## Development

### Frontend

Navigate to the `frontend/`.

You will also need to setup a pro TipTap extension which requires a special token that you can store in a local `.npmrc` file. See the guide:
https://tiptap.dev/docs/guides/pro-extensions

You will also need a `.env.development` file like this:

```env
VITE_API_BASE_URL=http://localhost:8000
```

To install deps:

```bash
npm install
```

To run:

```bash
npm run dev
```

### Backend

Navigate to the `backend/`.

You will need a `.env` file like this:

```env
OPENAI_API_KEY=sk-xxx
```

To setup:

```bash
poetry install
```

To run:

```bash
poetry run uvicorn app.main:app --reload --port 8000
```
