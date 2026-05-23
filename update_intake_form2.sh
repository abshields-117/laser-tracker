sed -i "s/{ key: 'sunExposure', label: 'Have you had active sun exposure\/tanning in the last 4 weeks?' },/{ key: 'sunExposure', label: 'Have you used any self tanner in the last 7 days or had active sun exposure in the last 4 weeks?' },/" /home/carl/.openclaw/workspace/projects/laser-tracker/components/IntakeForm.tsx

sed -i "s/{ key: 'accutane', label: 'Have you taken Accutane in the past 6 months?' },/{ key: 'sunExposure', label: 'Have you used any self tanner in the last 7 days or had active sun exposure in the last 4 weeks?' },\n              { key: 'accutane', label: 'Have you taken Accutane in the past 6 months?' },/" /home/carl/.openclaw/workspace/projects/laser-tracker/components/IntakeForm.tsx

sed -i "s/{ key: 'pregnant', label: 'Are you currently pregnant or breastfeeding?' },/{ key: 'pregnant', label: 'Are you currently pregnant or breastfeeding?' },\n              { key: 'recentBirth', label: 'Have you given birth in the last 12 months?' },/" /home/carl/.openclaw/workspace/projects/laser-tracker/components/IntakeForm.tsx

sed -i "s/{ key: 'photosensitive', label: 'Are you taking any photosensitive meds, retinol, or retin-a?' }/{ key: 'photosensitive', label: 'Are you taking any photosensitive meds, retinol, or retin-a?' },\n              { key: 'antibiotics', label: 'Are you currently taking antibiotics?' }/" /home/carl/.openclaw/workspace/projects/laser-tracker/components/IntakeForm.tsx

