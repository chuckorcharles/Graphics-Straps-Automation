# After-Effect-Graphics-Straps-Generator

A script that automates the generation of tune-in information for "In Program Promotion" graphics scraps. To be used with the Adobe After Effects project Graphics_Strap_Template.aep. Requires Adobe After Effects CC 2019 or later.

## Description
This script was created with an aim to automate the workflow of tune-in information versioning for IPPs. The task used to be manually done by motion graphics designer in After Effects. He/she need to duplicate the relevant composition template for each version and replace text layers one by one. The script automates this tedious task and graphics designer can spend more time on creative work.

## Data Preparation
The script reads in a csv file and uses that data to duplicate the relevant composition template, do text replacement and move them to the render folder for later batch rendering.
The csv file can be created simply by copy-and-pasting the relevant rows in the Producer Allocation excel sheet to an empty excel sheet, and subsequently exported as csv.

Each row will follow this format:
```
House number,,Show Title,,Premiere Date or Day,Time
```
(You may ignore the empty strings between commas which are placeholder columns from the Producer Allocation excel sheet)

Example:
```
50IPP352,,The Secret Life of My Secretary,,Tonight,8:10pm
```
								
## Dependencies
1. To be run in Adobe After Effects project Graphics_Strap_Template.aep.
2. Requires Adobe After Effects CC 2019 or later.
3. Footages and media files needed for the aep project are not provided in the Github repo due to disk space and copyright issues. 

## Video Demonstration

## Changelog

v1.1
1. Added support for long show title - show titles that are over 374 pixels in length will be automatically splitted into 2 lines to better fit the graphics strap.
2. 
