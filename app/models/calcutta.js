export class Calcutta {
    constructor(data = {}) {
        this.id = data.id || '';
        this.tournamentId = data.tournamentId || '';
        this.status = data.status || 'pending';
        this.totalPot = data.totalPot || 0;
        this.blindBids = data.blindBids || [];
        this.auctionResults = data.auctionResults || [];
        this.playerBuybacks = data.playerBuybacks || [];
        
        // Auction participants control
        this.participants = new Map(data.participants || []); // Map of userId to participant info
        this.pendingRequests = new Map(data.pendingRequests || []); // Map of userId to request info
        this.directorId = data.directorId || '';
        this.coDirectors = data.coDirectors || [];
        
        this.settings = {
            blindBidCount: data.settings?.blindBidCount || 3,
            minBid: data.settings?.minBid || 20,
            bidIncrement: data.settings?.bidIncrement || 5,
            payoutStructure: data.settings?.payoutStructure || {
                first: 50,
                second: 30,
                third: 20
            },
            buybackRules: {
                singles: 0.5,
                doubles: 0.667
            },
            payoutPositions: data.settings?.payoutPositions || 3,
            requireVerification: data.settings?.requireVerification !== false, // Require director approval
            allowLateEntries: data.settings?.allowLateEntries || false // Allow joining after start
        };
    }

    // Participant management
    requestToJoin(userId, userInfo) {
        if (this.participants.has(userId)) return false;
        
        if (this.settings.requireVerification) {
            this.pendingRequests.set(userId, {
                ...userInfo,
                requestedAt: new Date(),
                status: 'pending'
            });
            return true;
        } else {
            return this.addParticipant(userId, userInfo);
        }
    }

    addParticipant(userId, userInfo) {
        if (this.participants.has(userId)) return false;

        this.participants.set(userId, {
            ...userInfo,
            joinedAt: new Date(),
            totalBids: 0,
            totalSpent: 0,
            ownedPlayers: []
        });
        
        // Clear any pending request
        this.pendingRequests.delete(userId);
        return true;
    }

    approveRequest(userId, directorId) {
        if (!this.isDirector(directorId)) return false;
        
        const request = this.pendingRequests.get(userId);
        if (!request) return false;

        return this.addParticipant(userId, {
            ...request,
            approvedBy: directorId,
            approvedAt: new Date()
        });
    }

    denyRequest(userId, directorId, reason = '') {
        if (!this.isDirector(directorId)) return false;
        
        const request = this.pendingRequests.get(userId);
        if (!request) return false;

        request.status = 'denied';
        request.deniedBy = directorId;
        request.deniedAt = new Date();
        request.reason = reason;
        
        this.pendingRequests.set(userId, request);
        return true;
    }

    removeParticipant(userId, directorId) {
        if (!this.isDirector(directorId)) return false;
        if (!this.participants.has(userId)) return false;
        
        // Can't remove if they've already placed bids
        const participant = this.participants.get(userId);
        if (participant.totalBids > 0) return false;

        this.participants.delete(userId);
        return true;
    }

    // Director management
    isDirector(userId) {
        return userId === this.directorId || this.coDirectors.includes(userId);
    }

    addCoDirector(userId, mainDirectorId) {
        if (mainDirectorId !== this.directorId) return false;
        if (this.coDirectors.includes(userId)) return false;
        
        this.coDirectors.push(userId);
        return true;
    }

    removeCoDirector(userId, mainDirectorId) {
        if (mainDirectorId !== this.directorId) return false;
        
        const index = this.coDirectors.indexOf(userId);
        if (index === -1) return false;
        
        this.coDirectors.splice(index, 1);
        return true;
    }

    // Bidding validation
    canPlaceBid(userId) {
        return this.participants.has(userId) && 
               this.status === 'live-auction';
    }

    recordBid(userId, bid) {
        if (!this.canPlaceBid(userId)) return false;
        
        const participant = this.participants.get(userId);
        participant.totalBids++;
        participant.totalSpent += bid.amount;
        participant.ownedPlayers.push(bid.playerId);
        
        this.participants.set(userId, participant);
        return true;
    }

    getParticipantSummary(userId) {
        return this.participants.get(userId) || null;
    }

    getPendingRequests() {
        return Array.from(this.pendingRequests.entries())
            .filter(([_, request]) => request.status === 'pending')
            .map(([userId, request]) => ({
                userId,
                ...request
            }));
    }

    getParticipantList() {
        return Array.from(this.participants.entries())
            .map(([userId, info]) => ({
                userId,
                ...info
            }));
    }
}