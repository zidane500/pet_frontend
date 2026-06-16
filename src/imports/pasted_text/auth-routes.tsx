You are a Senior Product Designer and Senior Frontend Architect.

I already have a complete pet marketplace platform frontend built with a modern, responsive design.

IMPORTANT RULES:

Do NOT redesign existing pages.
Do NOT remove existing sections.
Do NOT modify the current visual identity.
Do NOT change colors, typography, spacing, cards, navbar, footer or dashboard structure.
Keep the exact same design language and component system.
Only create missing pages and connect all existing buttons with proper navigation and interactions.
Maintain full responsiveness for desktop, tablet and mobile.
PROJECT CONTEXT

This platform is a Tunisian pet ecosystem that includes:

Pet sales
Pet adoption
Lost and found animals
Veterinary directory
Pet shops
Community feed
User dashboard
Messaging system
Notifications
Favorites
Premium listings

Existing pages already created:

Home page
Feed page
Search page
Animal details page
User profile page
Dashboard page
Messages page
Notifications page
Favorites page
Settings page

Do not recreate those pages.

CREATE COMPLETE AUTHENTICATION SYSTEM

Create the following new pages.

1. LOGIN PAGE

Modern authentication page matching the existing design system.

Fields:

Email
Password

Options:

Remember me
Show/Hide password

Buttons:

Login
Continue with Google
Continue with Facebook

Links:

Forgot password?
Create an account

Validation states:

Success
Error
Loading
2. REGISTER PAGE

Allow account creation based on user role.

Step 1:

Choose account type with beautiful cards.

Roles:

Visitor / Pet Owner

Can:

Buy animals
Adopt animals
Publish lost animals
Publish found animals
Send messages
Save favorites
Veterinarian

Can:

Create veterinary profile
Manage appointments
Receive reviews
Manage services
Pet Shop

Can:

Create shop profile
Publish products
Promote services
Shelter / Rescue Center

Can:

Publish animals for adoption
Manage adoption requests
Receive donations
Breeder

Can:

Publish breeding listings
Manage available animals
Receive inquiries

Step 2:

Registration form.

Fields:

First name
Last name
Username
Email
Phone number
City
Password
Confirm password

Checkboxes:

Accept Terms
Accept Privacy Policy

Button:

Create account

3. FORGOT PASSWORD PAGE

Fields:

Email

Button:

Send recovery link

Success state:

"Recovery email sent successfully"

4. RESET PASSWORD PAGE

Fields:

New password
Confirm password

Button:

Reset password

Success page:

Password changed successfully.

CREATE ROLE SPECIFIC PROFILE CREATION PAGES
Veterinarian Profile Setup

Fields:

Clinic name
Specialty
Address
City
Phone
Description
Working hours
Profile image
Clinic images

Button:

Create Profile

Pet Shop Profile Setup

Fields:

Shop name
Address
Phone
Description
Logo
Cover image

Button:

Create Shop

Shelter Profile Setup

Fields:

Organization name
Description
Address
Contact

Button:

Create Shelter

Breeder Profile Setup

Fields:

Breeding name
Animal categories
Description
Location

Button:

Create Breeder Profile

HEADER NAVIGATION

Connect every header button.

Home

Navigate to homepage.

Feed

Navigate to community feed page.

Search

Navigate to search page.

Veterinarians

Navigate to veterinary directory.

Pet Shops

Navigate to shops directory.

Premium

Navigate to premium subscription page.

Messages

Navigate to messages page.

Notifications

Navigate to notifications page.

Profile Avatar

Open dropdown menu.

Items:

My Profile
My Listings
Favorites
Settings
Logout

Login button

Open Login page.

Register button

Open Register page.

DASHBOARD BUTTON CONNECTIONS

Connect all dashboard actions.

My Listings

Open listings management page.

Favorites

Open favorites page.

Messages

Open messages page.

Notifications

Open notifications page.

Settings

Open settings page.

LISTINGS MANAGEMENT

Inside "My Listings"

Connect all buttons.

Add Button

Open Create Listing page.

Edit Button

Open Edit Listing page.

Pause Button

Change listing status to paused.

Show status badge:

Paused

Resume Button

Reactivate listing.

Delete Button

Open confirmation modal.

Actions:

Cancel
Delete permanently

Listing Card Click

Open listing details page.

CREATE LISTING PAGE

Multi-step wizard.

Step 1

Listing type:

Sale
Adoption
Lost
Found
Breeding

Step 2

Animal information:

Name
Species
Breed
Gender
Age
Weight
Vaccination status

Step 3

Location:

City
Region

Step 4

Media:

Upload images
Upload video

Step 5

Description

Step 6

Preview

Step 7

Publish

ANIMAL DETAIL PAGE ACTIONS

Connect buttons:

Contact Owner
Send Message
Add to Favorites
Share
Report Listing
COMMUNITY FEED ACTIONS

Connect:

Like
Comment
Share
Follow user
View profile

Create realistic interaction states.

FAVORITES PAGE

Display:

Favorite animals
Favorite veterinarians
Favorite shops

Allow removing from favorites.

NOTIFICATIONS PAGE

Create notification categories:

Messages
Adoption requests
Listing updates
System notifications
SETTINGS PAGE

Tabs:

Profile
Edit information
Security
Change password
Notifications
Email notifications
Push notifications
Privacy
Public profile
Hidden profile
PREMIUM PAGE

Create subscription plans.

Starter

Professional

Business

Features comparison table.

Buttons:

Upgrade Plan

GLOBAL REQUIREMENTS
Keep the exact existing design language.
Use the same colors and typography already present in the project.
Reuse existing components whenever possible.
Do not duplicate existing pages.
Only create missing pages and interactions.
Every button in the project must have a destination, modal, action or state.
All navigation must be connected.
Generate realistic mock data.
Maintain production-level UX/UI quality.
Maintain accessibility standards.
Maintain responsive behavior on all devices.