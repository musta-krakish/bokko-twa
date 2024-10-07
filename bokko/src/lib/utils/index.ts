export default function createInitDataStr(initData: any): string {
    return new URLSearchParams({
        query_id: initData.queryId,
        auth_date: (initData.authDate.getTime() / 1000).toString(),
        hash: initData.hash,
        user: JSON.stringify({
            id: initData.user?.id,
            first_name: initData.user?.firstName,
            last_name: initData.user?.lastName,
            username: initData.user?.username,
            language_code: initData.user?.languageCode,
            is_premium: initData.user?.isPremium,
            allows_write_to_pm: initData.user?.allowsWriteToPm,
        })
    }).toString();
}
