<script lang="ts">
    import Flex from "$lib/components/layout/flex.svelte";
    import { page } from "$app/stores";
    import Button from "$lib/components/Button.svelte";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { ListBullet, CircleStack, Calendar, DocumentText, ClipboardDocumentCheck, Wrench } from "@steeze-ui/heroicons";
    import User from "$lib/components/user/User.svelte";
</script>

<Flex gap={0} class="h-screen overflow-hidden">
    <div
        class="shrink-0 h-screen bg-zinc-100 border-r-zinc-500/50 shadow-2xl border"
    >
        <Flex gap={0} direction="col" class="h-[calc(100vh-2px)]">
            <div class="border border-b-zinc-500/50 p-6">
                <h1 class="text-xl font-bold">Nomenclaturize</h1>
            </div>

            <div class="grow p-6">
                <Flex direction="col" gap={3}>
                    <a
                        href="/app/articles"
                        class="hover:text-violet-500 hover:font-medium"
                        class:text-blue-500={$page.route.id?.includes(
                            "/app/articles"
                        )}
                    >
                        <Icon src={CircleStack} class="h-5 w-5 mb-0.5 inline" />
                        Base articles
                    </a>
                    <a
                        href="/app/nomenclatures"
                        class="hover:text-violet-500 hover:font-medium"
                        class:text-blue-500={$page.route.id?.includes(
                            "/app/nomenclatures"
                        )}
                    >
                        <Icon src={ListBullet} class="h-5 w-5 mb-0.5 inline" />
                        Nomenclatures
                    </a>
                    <a
                        href="/app/lists"
                        class="hover:text-violet-500 hover:font-medium"
                        class:text-blue-500={$page.route.id?.includes(
                            "/app/lists"
                        )}
                    >
                        <Icon src={ClipboardDocumentCheck} class="h-5 w-5 mb-0.5 inline" />
                        Listes d'achat
                    </a>
                    <a
                        href="/app/projects"
                        class="hover:text-violet-500 hover:font-medium"
                        class:text-blue-500={$page.route.id?.includes(
                            "/app/projects"
                        )}
                    >
                        <Icon src={DocumentText} class="h-5 w-5 mb-0.5 inline" />
                        Affaires
                    </a>
                    <a
                        href="/app/planning"
                        class="hover:text-violet-500 hover:font-medium"
                        class:text-blue-500={$page.route.id?.includes(
                            "/app/planning"
                        )}
                    >
                        <Icon src={Calendar} class="h-5 w-5 mb-0.5 inline" />
                        Planning
                    </a>
                    <a
                        href="/app/fabrication_orders"
                        class="hover:text-violet-500 hover:font-medium"
                        class:text-blue-500={$page.route.id?.includes(
                            "/app/fabrication_orders"
                        )}
                    >
                        <Icon src={Wrench} class="h-5 w-5 mb-0.5 inline" />
                        Ordres des fabrication
                    </a>
                </Flex>
            </div>

            <div class="border border-t-zinc-500/50 p-6">
                <User user={$page.data.user} />
                <a
                    href="/auth/logout"
                    class="mt-4 block"
                    data-sveltekit-preload-data="off"
                >
                    <Button
                        borderColor="border-red-500"
                        hoverColor="hover:bg-red-500"
                        size="small"
                    >
                        Se déconnecter
                    </Button>
                </a>
            </div>
        </Flex>
    </div>

    <div class="grow p-6 overflow-y-scroll">
        <slot />
    </div>
</Flex>
