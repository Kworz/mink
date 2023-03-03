<script lang="ts">
    import Flex from "$lib/components/layout/flex.svelte";
    import { page } from "$app/stores";
    import Button from "$lib/components/Button.svelte";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { ListBullet, CircleStack, Calendar, DocumentText, ClipboardDocumentCheck, Wrench, Bars3, Truck, DocumentChartBar, QueueList, QrCode } from "@steeze-ui/heroicons";
    import User from "$lib/components/user/User.svelte";

    let menuShown = false;

</script>

<Flex gap={0} class="{menuShown ? "h-screen overflow-hidden" : ""}" direction={menuShown ? "row" : "col"}>

    {#if menuShown}
        <div
            class="shrink-0 bg-zinc-100 border-r-zinc-500/50 shadow-2xl border duration-300"
            class:h-screen={menuShown}
        >
            <Flex gap={0} direction="col" class="h-[calc(100vh-2px)]">
                <button class="border border-b-zinc-500/50 p-6 block" on:click={() => menuShown = !menuShown}>
                    <Flex items="start">
                        <Icon src={Bars3} class="h-6 w-6 text-gray-800" />
                        <h1 class="text-base font-semibold">Nomenclaturize</h1>
                    </Flex>
                </button>

                <div class="grow p-6">
                    <Flex direction="col" gap={3}>
                        <h3 class="mb-2">Outils</h3>
                        <a
                            href="/app/scanner"
                            class="hover:text-violet-500 hover:font-medium"
                            class:text-blue-500={$page.route.id?.includes(
                                "/app/scanner"
                            )}
                        >
                            <Icon src={QrCode} class="h-5 w-5 mb-0.5 inline" />
                            Scanner Codes QR
                        </a>
                        <h3 class="mb-2">Articles</h3>
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
                            href="/app/suppliers"
                            class="hover:text-violet-500 hover:font-medium"
                            class:text-blue-500={$page.route.id?.includes(
                                "/app/suppliers"
                            )}
                        >
                            <Icon src={Truck} class="h-5 w-5 mb-0.5 inline" />
                            Fournisseurs
                        </a>
                        <a
                            href="/app/approx"
                            class="hover:text-violet-500 hover:font-medium"
                            class:text-blue-500={$page.route.id?.includes(
                                "/app/approx"
                            )}
                        >
                            <Icon src={QueueList} class="h-5 w-5 mb-0.5 inline" />
                            Approvisionements
                        </a>
                        <h3 class="my-2">Nomenclatures</h3>
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
                        <h3 class="my-2">Gestion</h3>
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
                            href="/app/orders"
                            class="hover:text-violet-500 hover:font-medium"
                            class:text-blue-500={$page.route.id?.includes(
                                "/app/orders"
                            )}
                        >
                            <Icon src={DocumentChartBar} class="h-5 w-5 mb-0.5 inline" />
                            Commandes
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
                            Ordres de fabrication
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
    {:else}
        <button on:click={() => menuShown = !menuShown} class="p-2 md:p-4 border-b border-zinc-500/50 bg-zinc-100 w-screen fixed z-50">
            <Flex items="start">
                <Icon src={Bars3} class="h-6 w-6 text-gray-800" />
                <h1 class="text-base font-semibold">Nomenclaturize</h1>
            </Flex>
        </button>
    {/if}

    <div class="grow p-6" class:overflow-y-scroll={menuShown} class:mt-14={!menuShown}>
        <slot />
    </div>
</Flex>
