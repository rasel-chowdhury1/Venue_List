import { Request, Response } from "express";


export const getStaticAccountDeletePolicy = (_req: Request, res: Response) => {
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Delete Account - This is Mauritius</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 40px;
      padding: 0;
      background-color: #ffffff;
      color: #333;
      line-height: 1.6;
    }
    h1, .intro {
      text-align: center;
    }
    h1 {
      color: #e91e63;
      margin-bottom: 10px;
    }
    h2 {
      color: #e91e63;
      margin-top: 32px;
    }
    .step {
      margin-bottom: 26px;
      text-align: left;
      max-width: 820px;
      margin-left: auto;
      margin-right: auto;
    }
    .illustration {
      display: block;
      margin: 10px auto;
      max-width: 320px;    /* limit width */
      max-height: 200px;   /* smaller height */
      width: 100%;
      height: auto;
      object-fit: contain;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 4px;
      background: #fff;
    }
    footer {
      margin-top: 48px;
      font-size: 0.9rem;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Steps to Delete Your Account</h1>
  <p class="intro">
    Follow these steps to permanently delete your account from the <strong>This is Mauritius</strong> app.
  </p>

  <div class="step">
    <h2>Step 1: Open Settings</h2>
    <p>Go to your profile and tap <strong>Settings</strong>.</p>
    <img src="/uploads/static/setting.png" alt="Open Settings" class="illustration">
  </div>

  <div class="step">
    <h2>Step 2: Choose “Delete Account”</h2>
    <p>Scroll to the bottom and tap <strong>Delete Account</strong>.</p>
    <img src="/uploads/static/delete.png" alt="Choose Delete Account" class="illustration">
  </div>

  <div class="step">
    <h2>Step 3: Confirm Your Identity</h2>
    <p>When prompted, enter your account password (or confirm via your chosen method) and review the warning message.</p>
    <img src="/uploads/static/password.png" alt="Confirm Identity" class="illustration">
  </div>

  <div class="step">
    <h2>Step 4: Confirm Deletion</h2>
    <p>Tap <strong>Delete</strong> to finalize. You will be signed out automatically and your account will be scheduled for deletion.</p>
    <img src="/uploads/static/pass-delete.png" alt="Confirm Deletion" class="illustration">
  </div>

  <div class="step">
    <h2>What Happens Next</h2>
    <ul>
      <li>Your account and personal data are deleted according to our retention and legal obligations.</li>
      <li>You will no longer have access to your profile, saved items, or preferences.</li>
      <li>If you change your mind before deletion is completed, contact support immediately.</li>
    </ul>
  </div>

  <footer>
    © 2025 This is Mauritius. All rights reserved.
  </footer>
</body>
</html>
  `;
  res.send(html);
};