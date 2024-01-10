echo on
docker build -f API\Dockerfile --force-rm --tag fnatikjk/back_crm_66bit .
docker push fnatikjk/back_crm_66bit
@echo off
pause