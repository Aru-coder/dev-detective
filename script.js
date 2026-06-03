const result = document.getElementById("result");
const loading = document.getElementById("loading");

const singleBtn = document.getElementById("singleBtn");
const battleBtn = document.getElementById("battleBtn");

const singleSearch = document.getElementById("singleSearch");
const battleSearch = document.getElementById("battleSearch");

singleBtn.addEventListener("click", () => {

    singleBtn.classList.add("active");
    battleBtn.classList.remove("active");

    singleSearch.classList.remove("hidden");
    battleSearch.classList.add("hidden");

    result.innerHTML = "";
});

battleBtn.addEventListener("click", () => {

    battleBtn.classList.add("active");
    singleBtn.classList.remove("active");

    battleSearch.classList.remove("hidden");
    singleSearch.classList.add("hidden");

    result.innerHTML = "";
});

function formatDate(dateString){

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB",{
        day:"numeric",
        month:"short",
        year:"numeric"
    });
}

async function searchUser(){

    const username =
    document.getElementById("username").value.trim();

    if(!username) return;

    loading.innerHTML="Loading...";
    result.innerHTML="";

    try{

        const response =
        await fetch(
        `https://api.github.com/users/${username}`
        );

        if(!response.ok){
            throw new Error("User Not Found");
        }

        const user = await response.json();

        displayProfile(user);

        fetchRepos(user.repos_url);

    }

    catch(error){

        result.innerHTML=`
        <div class="error">
        User Not Found
        </div>
        `;
    }

    loading.innerHTML="";
}

function displayProfile(user){

    result.innerHTML=`

    <div class="card">

        <img
        class="avatar"
        src="${user.avatar_url}"
        >

        <div class="info">

            <h2>
            ${user.name || user.login}
            </h2>

            <p>${user.bio || "No bio available"}</p>

            <p>
            Joined:
            ${formatDate(user.created_at)}
            </p>

            <p>
            Followers:
            ${user.followers}
            </p>

            <p>
            Following:
            ${user.following}
            </p>

            ${
                user.blog
                ?
                `<a target="_blank"
                href="${user.blog}">
                Portfolio
                </a>`
                :
                ""
            }

        </div>

    </div>

    <div id="repos"></div>
    `;
}

async function fetchRepos(url){

    const response = await fetch(url);

    const repos = await response.json();

    repos.sort(
        (a,b)=>
        new Date(b.created_at) -
        new Date(a.created_at)
    );

    const latestRepos = repos.slice(0,5);

    let html = `
    <div class="repo-list">
    <h3>Latest Repositories</h3>
    `;

    latestRepos.forEach(repo=>{

        html += `
        <div class="repo">

        <a
        href="${repo.html_url}"
        target="_blank">

        ${repo.name}

        </a>

        </div>
        `;
    });

    html += "</div>";

    document
    .getElementById("repos")
    .innerHTML = html;
}

async function getUserData(username){

    const userRes =
    await fetch(
    `https://api.github.com/users/${username}`
    );

    if(!userRes.ok){
        throw new Error();
    }

    const user =
    await userRes.json();

    const repoRes =
    await fetch(user.repos_url);

    const repos =
    await repoRes.json();

    const totalStars =
    repos.reduce(
    (sum,repo)=>
    sum + repo.stargazers_count,
    0
    );

    return {
        user,
        totalStars
    };
}

async function battleMode(){

    const username1 =
    document.getElementById("user1").value.trim();

    const username2 =
    document.getElementById("user2").value.trim();

    if(!username1 || !username2){
        return;
    }

    loading.innerHTML="Loading...";
    result.innerHTML="";

    try{

        const [player1,player2] =
        await Promise.all([

            getUserData(username1),
            getUserData(username2)

        ]);

        const winner =
        player1.totalStars >
        player2.totalStars
        ? player1
        : player2;

        const loser =
        player1.totalStars >
        player2.totalStars
        ? player2
        : player1;

        result.innerHTML=`

        <div class="card winner">

            <img
            class="avatar"
            src="${winner.user.avatar_url}"
            >

            <div class="info">

                <h2>
                🏆 Winner:
                ${winner.user.login}
                </h2>

                <p>
                Total Stars:
                ${winner.totalStars}
                </p>

            </div>

        </div>

        <div class="card loser">

            <img
            class="avatar"
            src="${loser.user.avatar_url}"
            >

            <div class="info">

                <h2>
                ❌ Loser:
                ${loser.user.login}
                </h2>

                <p>
                Total Stars:
                ${loser.totalStars}
                </p>

            </div>

        </div>
        `;
    }

    catch{

        result.innerHTML=`
        <div class="error">
        One or both users not found.
        </div>
        `;
    }

    loading.innerHTML="";
}