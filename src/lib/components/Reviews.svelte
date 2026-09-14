<script lang="ts">
  import { reveal } from "../actions/reveal";
  import { reviews } from "../data/reviews";
  import { i18nStore } from "../stores/i18n.svelte";

  const revealBaseDelay = 40;
  const revealStepDelay = 80;

  let t = $derived(i18nStore.t);
</script>

<section
  id="reviews"
  class="relative py-12 sm:py-16 px-4 scroll-mt-16"
  use:reveal={{ direction: "up", distance: 30, replayOnEnable: true }}
>
  <div class="container mx-auto">
    <div class="max-w-6xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.reviews.title}</h2>
        <p class="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {t.reviews.subtitle}
        </p>

        <!-- Trust Highlights -->
        <div
          class="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-6 text-xs text-muted-foreground"
        >
          <div
            class="flex items-center gap-1.5 bg-card/90 dark:bg-card/60 backdrop-blur-md border border-border/50 dark:border-white/[0.08] px-3.5 py-1.5 rounded-full shadow-xs"
          >
            <div class="flex text-amber-400 text-xs">
              {#each Array(5) as _}
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  ></path>
                </svg>
              {/each}
            </div>
            <span class="font-bold text-foreground">5.0</span>
            <span class="opacity-75 font-medium">{t.reviews.ratingScore}</span>
          </div>

          <div
            class="flex items-center gap-1.5 bg-card/90 dark:bg-card/60 backdrop-blur-md border border-border/50 dark:border-white/[0.08] px-3.5 py-1.5 rounded-full shadow-xs"
          >
            <svg
              class="w-3.5 h-3.5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span class="font-medium text-foreground">{t.reviews.satisfactionScore}</span>
          </div>

          <div
            class="flex items-center gap-1.5 bg-card/90 dark:bg-card/60 backdrop-blur-md border border-border/50 dark:border-white/[0.08] px-3.5 py-1.5 rounded-full shadow-xs"
          >
            <svg
              class="w-3.5 h-3.5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
            <span class="font-medium text-foreground">{t.reviews.deliveryScore}</span>
          </div>
        </div>
      </div>

      <!-- Reviews Grid -->
      <div class="grid md:grid-cols-2 gap-6 sm:gap-8">
        {#each reviews as review, i (review.id)}
          {@const reviewInfo = t.reviews.items[review.id]}
          {@const role = reviewInfo?.role || review.role}
          {@const company = reviewInfo?.company || review.company}
          {@const project = reviewInfo?.project || review.project}
          {@const content = reviewInfo?.content || review.content}

          <div
            class="bg-card/90 dark:bg-card/60 backdrop-blur-md border border-border/50 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-black/40 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between relative group overflow-hidden"
            use:reveal={{
              delay: revealBaseDelay + i * revealStepDelay,
              replayOnEnable: true,
            }}
          >
            <!-- Top Gradient Accent -->
            <div
              class={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${review.accentGradient} opacity-75 group-hover:opacity-100 transition-opacity`}
            ></div>

            <!-- Decorative Watermark Quote -->
            <svg
              class="absolute top-5 right-5 w-12 h-12 text-muted-foreground/10 group-hover:text-primary/15 transition-colors pointer-events-none"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
              ></path>
            </svg>

            <!-- Card Top: Rating & Project Tag -->
            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <div class="flex items-center gap-1 text-amber-400">
                  {#each Array(review.rating) as _}
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      ></path>
                    </svg>
                  {/each}
                </div>

                <span
                  class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {project}
                </span>
              </div>

              <!-- Quote Content -->
              <p
                class="text-foreground/90 dark:text-foreground/80 text-sm sm:text-[15px] leading-relaxed mb-6 italic"
              >
                “{content}”
              </p>
            </div>

            <!-- Card Bottom: Author Info & Verified Badge -->
            <div
              class="flex items-center justify-between pt-4 border-t border-border/50 dark:border-white/[0.06] mt-auto"
            >
              <div class="flex items-center gap-3">
                <div
                  class={`w-10 h-10 rounded-full bg-gradient-to-br ${review.avatarGradient} flex items-center justify-center text-white font-semibold text-xs shadow-xs ring-2 ring-background`}
                >
                  {review.avatarInitials}
                </div>
                <div>
                  <h3
                    class="font-semibold text-sm text-foreground group-hover:text-primary transition-colors"
                  >
                    {review.name}
                  </h3>
                  <p class="text-xs text-muted-foreground">
                    {role} <span class="opacity-50">•</span>
                    <span class="text-foreground/80 font-medium">{company}</span>
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
                title={t.reviews.verifiedBadge}
              >
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="hidden sm:inline">{t.reviews.verifiedBadge}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
