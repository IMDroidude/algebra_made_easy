# Companion notebooks

Hands-on Jupyter notebooks for **Algebra Made Easy**. Each one follows a module of the
website and uses NumPy, Matplotlib and Plotly for small, AI-flavoured experiments.

| Notebook | Module |
|---|---|
| `module-1-coordinates.ipynb` | 1 · Understanding coordinates and 3D space |

The website serves a copy for download from `public/notebooks/`.

## Run it locally

From the repository root (macOS / Linux):

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r notebooks/requirements.txt
.venv/bin/jupyter lab notebooks/
```

On Windows use `.venv\Scripts\python` and `.venv\Scripts\jupyter` instead.

Open the notebook and run the cells top to bottom (Shift + Enter). Every cell runs
without edits; cells marked **Try it** contain a `TODO` for you to change.

The 3D plots load plotly.js from a CDN to keep the file small, so they need an internet
connection the first time they render.

## Other ways to open it

- **Google Colab:** go to <https://colab.research.google.com>, choose *File → Upload notebook*,
  and pick the `.ipynb` file. NumPy, Matplotlib and Plotly are preinstalled.
- **VS Code:** install the *Jupyter* and *Python* extensions, open the `.ipynb` file and
  choose the `.venv` interpreter as the kernel.

## Check that a notebook still runs

```sh
.venv/bin/jupyter nbconvert --to notebook --execute --inplace notebooks/module-1-coordinates.ipynb
cp notebooks/module-1-coordinates.ipynb public/notebooks/
```
