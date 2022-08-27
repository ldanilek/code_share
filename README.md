# Code Share

Using CodeMirror and Convex.
Deployed on Vercel at [code-share-convex.vercel.app](https://code-share-convex.vercel.app)

# What is it?

Shared code editor. Every user (and every tab) looking at code-share-convex.vercel.app will view and edit the same code.

It has a few rough edges, and it's not super fast, but it seems to work in most cases.

It does conflict resolution completely server-side.
The typeCode and setCursor functions are simple, as are their optimistic updates. The meat of the logic is in getCursor and getCode.

## Extra features

We track the cursor for each user, to let them type smoothly even as other users type. This cursor tracking also lets us compute presence, so you can see how many users are viewing the page (presence is sticky for 5 seconds).

To help with efficiency, we periodically call compressCode to compress the full history of individual keystrokes into a snapshot of the code.

