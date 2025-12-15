# Debug Instructions for Lead Quality Issues

## Problem Fixed
The dashboard was randomly assigning quality values when it couldn't find or parse the quality field from your data, causing the data to change on each page refresh.

## Changes Made
1. **Removed Random Assignment**: No more random quality values are assigned
2. **Added Debug Logging**: Console logs will show you exactly what data is being received
3. **Improved Quality Parsing**: Better handling of various quality field names and values
4. **Default to "средний"**: When quality can't be determined, it defaults to "средний" instead of random

## How to Debug
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Refresh your dashboard page
4. Look for these log messages:
   - `Raw API response:` - Shows the raw data from your API
   - `Extracted leads:` - Shows the processed leads array
   - `First lead sample:` - Shows the first lead object
   - `Available fields in first lead:` - Shows all field names in your data
   - `Found quality field "..." with value: "..."` - Shows which quality field was found and its value
   - `No quality field found for lead ...` - Shows when no quality field is found

## What to Check
1. **Field Names**: Check if your data has a quality field with a different name than expected
2. **Field Values**: Check if the quality values in your data match the expected format
3. **Data Structure**: Verify the overall structure of your data

## Expected Quality Values
The system now recognizes these quality values:
- **High Quality**: "высокий", "high", "отличный", "excellent", "высокое", "высокого", "высокая", "высокое качество", "high quality"
- **Good Quality** (mapped to High): "хороший", "good", "хорошее", "хорошего", "хорошая", "хорошее качество", "good quality"
- **Medium Quality**: "средний", "medium", "average", "нормальный", "среднее", "среднего", "средняя", "среднее качество", "medium quality"
- **Low Quality**: "низкий", "low", "bad", "плохой", "низкое", "низкого", "низкая", "низкое качество", "low quality"

## Quality Field Names
The system looks for these field names:
- "lead_quality", "качество", "quality", "grade", "статус", "status"
- "приоритет", "priority", "Lead Quality", "Качество", "Quality"
- "Grade", "Статус", "Status", "Приоритет", "Priority"
- "качество_лида", "lead_grade", "quality_level", "уровень_качества"
- "Качество лида", "Lead Grade", "Quality Level", "Уровень качества"

If your data uses different field names or values, please share the console output so we can adjust the parsing logic accordingly.



