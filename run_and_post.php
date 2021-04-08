<?php
chdir(__DIR__);

$bankAccId = 913035;
$result = json_decode(`docker-compose run -e "PPTR_HEADLESS=1" puppeteer`, true);

if (empty($result['filename'])) {
    return;
}

$filename = str_replace("/home/node", __DIR__, $result['filename']);
system("freeagent upload-statement-file $bankAccId $filename");