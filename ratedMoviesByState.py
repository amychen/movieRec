import csv
import json
from collections import Counter

def consolidateUsersByState(uF, rF): #{'state': ['1', '1241', '2', '322', ...]}
    userFile = csv.reader(open(uF), delimiter=",")
    userState = {}
    for row in userFile: 
        userState.update({row[0] : row[-1]})
    consolidateMoviesToUser(userState, rF)

def createMovieIdDictionary(): #{'movieId': 'name of movie'}
    moviesFile = csv.reader(open('ml-1m/movies.csv'), delimiter=",")
    movies = {}
    for row in moviesFile:
        movies.update({row[0] : row[1]})
    
    return movies
 
def consolidateMoviesToUser(userState, rF): #{'userID': ['name of movie1', 'name of movie2', 'name of movie3', ...]}
    ratingFile = csv.reader(open(rF), delimiter=",")
    moviesID = createMovieIdDictionary()
    userMovies = {}
    for row in ratingFile: 
        userID = row[0]
        movieName = moviesID[row[1]]
        try: 
            userMovies[userID].append(movieName)
        except:
            userMovies.update({userID : [movieName]})
    consolidateStateMovieCount(userState, userMovies)

def consolidateStateMovieCount(userState, userMovies): #{'state': [{'name of movie': 'count'}, ...]}
    stateMovieCount = {}
    for user in userState:
        state = userState[user]
        try: 
            if (stateMovieCount[state] != None):
                try: 
                    stateMovieCount[state][movie] += 1 
                except:
                   stateMovieCount[state][movie] = 1  
        except:
            stateMovieCount.update({state: {}})
            currUserMovies = userMovies[user]
            for movie in currUserMovies:
                stateMovieCount[state][movie] = 1
                
    with open("stateMoviesCount.json", "w") as outfile:
        json.dump(stateMovieCount, outfile)

    return stateMovieCount


def main():
    consolidateUsersByState('ml-1m/user_zip.csv', 'ml-1m/ratings.csv')

if __name__ == "__main__":
    main()