init:
    read -p "Enter your OpenAI API key: " key && echo "OPENAI_API_KEY=$key" > .env && echo "OPENAI_API_KEY=$key" > chapter-4-biscuit-selector/biscuit-selector-app/.env
    just create-env

create-env:
    conda env create -f environment.yml

destroy-env:
    conda env remove -n enterprise-ai

update-env:
    conda env update -n enterprise-ai -f environment.yml --prune

check-env:
    conda run -n enterprise-ai python -c "import crewai; print('OK')"

notebook:
    conda run -n enterprise-ai jupyter lab
