# Signing in, members and passwords

## Create the owner account

Open your new deploy. The sign-in page shows **Create the owner account**. Enter your name, email and a password (10 to 128 characters; a few words in a row is fine). You are signed in and taken to setup. This form only ever appears once: after the first account exists nobody can sign themselves up.

## Add a member

1. Settings, **Members**, then **Add member**. Only owners and admins see it.
2. Enter their name and email and pick a role.
3. Use **Generate** for a temporary password (or type your own, 10 characters or more) and copy it.
4. Press **Add member**, then give them the email and password yourself. No email is sent.

They sign in with it and are asked to choose their own password before they can do anything else.

## Reset someone's password

Settings, Members, the **...** menu on their row, **Reset password**. Set or generate a new temporary password and pass it on. They are signed out on every device and must choose a new password at next sign-in. You cannot reset your own here; use Account.

## Change your own password

Settings, **Account**. Enter your current password and the new one twice. Your other devices are signed out.

## I forgot my password

Ask an owner or admin to reset it from Settings, Members. Keep a second owner or admin so someone can always reset yours.

## Google, Microsoft and SSO

Optional extras. When they are set up, their buttons appear on the sign-in page. Only people whose email is allowed by `ALLOWED_SIGN_IN` can arrive that way; people you add yourself always can sign in with their password.
