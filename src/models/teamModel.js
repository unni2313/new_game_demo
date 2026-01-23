/**
 * Team Structure
 * This defines the shape of a Team object in our application.
 */
export const TeamModel = (data) => {
    return {
        teamName: data.teamName,
        tagLine: data.tagLine,
        scores: Number(data.scores || 0),
        wins: Number(data.wins || 0),
        draws: Number(data.draws || 0),
        losts: Number(data.losts || 0),
        createdAt: new Date()
    };
};
