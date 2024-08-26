#!/bin/bash

set -e

# Check for Python
if ! command -v python &> /dev/null
then
    echo "Python could not be found. Please install Python and try again."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "myenv" ]; then
    echo "Creating virtual environment..."
    python -m venv myenv
fi

# Activate virtual environment
if [ -d "myenv/bin" ]; then
    # For Unix-based systems
    source myenv/bin/activate
elif [ -d "myenv/Scripts" ]; then
    # For Windows systems
    source myenv/Scripts/activate
else
    echo "Could not find the virtual environment activation script."
    exit
fi

# Install required packages if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing required packages..."
    pip install -r requirements.txt
else
    echo "No requirements.txt found, skipping package installation."
fi

# Run the parser script
echo "Running the Python parser script..."
python parser.py

# Check if the result folder exists
if [ ! -d "result" ]; then
    echo "The result folder was not created. Something might have gone wrong."
    exit 1
fi

# Display the contents of the result folder
echo "Showing the contents of the result folder:"
find result

# Push to GitHub
#GITHUB_TOKEN="your_github_token_here"
#REPO="your_username/your_repo"
#BRANCH="your_branch_name"

#echo "Pushing changes to GitHub..."
#cd result
#git init
#git remote add origin https://$GITHUB_TOKEN@github.com/$REPO.git
#git checkout -b $BRANCH
#git add .
#git commit -m "Auto-generated by parser"
#git push -u origin $BRANCH

# Supabase integration (example request)
#SUPABASE_URL="https://your-project.supabase.co"
#SUPABASE_KEY="your_supabase_api_key"

#echo "Sending request to Supabase..."
#curl -X POST "${SUPABASE_URL}/rest/v1/your-table" \
#  -H "apikey: ${SUPABASE_KEY}" \
#  -H "Authorization: Bearer ${SUPABASE_KEY}" \
#  -H "Content-Type: application/json" \
#  -d '{"field": "value"}'

echo "Script execution completed."
