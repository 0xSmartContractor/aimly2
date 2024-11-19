export class FilterService {
    constructor() {
        this.filters = {
            skillLevel: {
                apa: { min: 0, max: 9 },
                bca: { min: 0, max: 7 },
                tap: { min: 0, max: 6 }
            },
            stats: {
                minWinRate: 0,
                maxWinRate: 100
            },
            sortBy: 'winRate' // winRate, wins, skillAPA
        };
    }
    
    getCurrentFilters() {
        return { ...this.filters };
    }
    
    setFilters(newFilters) {
        this.filters = { ...newFilters };
    }
    
    getCurrentSort() {
        return this.filters.sortBy;
    }
    
    applyFilters(players) {
        return players.filter(player => {
            // Skill level filters
            const meetsAPA = player.skillLevels.apa >= this.filters.skillLevel.apa.min &&
                           player.skillLevels.apa <= this.filters.skillLevel.apa.max;
            
            const meetsBCA = player.skillLevels.bca >= this.filters.skillLevel.bca.min &&
                           player.skillLevels.bca <= this.filters.skillLevel.bca.max;
            
            const meetsTAP = player.skillLevels.tap >= this.filters.skillLevel.tap.min &&
                           player.skillLevels.tap <= this.filters.skillLevel.tap.max;
            
            // Win rate filter
            const winRate = parseFloat(player.stats.winRate);
            const meetsWinRate = winRate >= this.filters.stats.minWinRate &&
                               winRate <= this.filters.stats.maxWinRate;
            
            return meetsAPA && meetsBCA && meetsTAP && meetsWinRate;
        });
    }
}